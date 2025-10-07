import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import rateLimit from 'express-rate-limit';
import validateEnv from './envValidation.js';
import DOMPurify from 'isomorphic-dompurify';
import * as Sentry from '@sentry/node';
import { trackOpenAIUsage, getUsageStats } from './src/middleware/openaiUsageTracking.js';

dotenv.config();
validateEnv();

// Initialize Sentry for error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Performance Monitoring
    integrations: [
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
  });
}

const openai = trackOpenAIUsage(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));

const app = express();
const PORT = process.env.PORT || 3000;

// Sentry request handler must be the first middleware
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.PRODUCTION_DOMAIN || ''
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const error = new Error('Accesso non autorizzato. Origine della richiesta non permessa.');
      error.statusCode = 403;
      callback(error);
    }
  },
  credentials: true
}));

app.use(express.json());

// Rate limiting: 20 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per windowMs
  message: {
    error: 'Hai raggiunto il limite di richieste orarie. Riprova tra qualche minuto.',
    code: 'RATE_LIMIT_EXCEEDED',
    suggestedAction: 'Attendi prima di inviare nuove richieste'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to chat endpoint
app.use('/api/chat', limiter);

// Sanitization utility functions
const sanitizeText = (input) => {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], KEEP_CONTENT: true });
};

const sanitizeHTML = (input) => {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  });
};

// CSP Configuration - Structured approach for better maintainability
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  fontSrc: ["'self'", "data:"],
  connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com"],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: [],
  blockAllMixedContent: []
};

// Helper function to build CSP header from directive object
const buildCSP = (directives) => {
  return Object.entries(directives)
    .map(([key, values]) => {
      // Convert camelCase to kebab-case (e.g., defaultSrc -> default-src)
      const directive = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      // Return directive with values or standalone directive
      return values.length > 0
        ? `${directive} ${values.join(' ')}`
        : directive;
    })
    .join('; ');
};

// Security Headers Middleware
app.use((req, res, next) => {
  // XSS Protection Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Content Security Policy - Full implementation with all directives
  res.setHeader('Content-Security-Policy', buildCSP(cspDirectives));

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OpenAI usage statistics endpoint
app.get('/api/usage-stats', (req, res) => {
  getUsageStats(req, res);
});

// Chat endpoint with streaming support
app.post('/api/chat', async (req, res) => {
  // Timeout configuration
  const TIMEOUT_MS = 30000; // 30 seconds
  let timeoutId;

  try {
    const { messages, model = 'gpt-4' } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Formato della richiesta non valido.',
        code: 'INVALID_REQUEST_FORMAT',
        suggestedAction: 'Ricarica la pagina e riprova'
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: 'Il messaggio non può essere vuoto.',
        code: 'EMPTY_MESSAGE',
        suggestedAction: 'Scrivi un messaggio e riprova'
      });
    }

    // Validate and sanitize messages structure
    const validRoles = ['system', 'user', 'assistant'];
    const sanitizedMessages = [];

    for (const message of messages) {
      if (!message || typeof message !== 'object') {
        return res.status(400).json({
          error: 'Formato del messaggio non valido.',
          code: 'INVALID_MESSAGE_FORMAT',
          suggestedAction: 'Ricarica la pagina e riprova'
        });
      }
      if (!message.role || !validRoles.includes(message.role)) {
        return res.status(400).json({
          error: 'Ruolo del messaggio non valido.',
          code: 'INVALID_MESSAGE_ROLE',
          suggestedAction: 'Ricarica la pagina e riprova'
        });
      }
      if (!message.content || typeof message.content !== 'string') {
        return res.status(400).json({
          error: 'Il contenuto del messaggio deve essere un testo.',
          code: 'INVALID_MESSAGE_CONTENT',
          suggestedAction: 'Scrivi un messaggio testuale e riprova'
        });
      }
      if (message.content.length > 10000) {
        return res.status(400).json({
          error: 'Il messaggio è troppo lungo. Massimo 10.000 caratteri.',
          code: 'MESSAGE_TOO_LONG',
          suggestedAction: 'Riduci la lunghezza del messaggio'
        });
      }

      // Sanitize message content
      sanitizedMessages.push({
        role: message.role,
        content: sanitizeText(message.content)
      });
    }

    // Validate model parameter
    if (typeof model !== 'string' || model.trim() === '') {
      return res.status(400).json({
        error: 'Parametro del modello non valido.',
        code: 'INVALID_MODEL_PARAMETER',
        suggestedAction: 'Ricarica la pagina e riprova'
      });
    }

    // Validate model against allowed list
    const allowedModels = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    if (!allowedModels.includes(model)) {
      return res.status(400).json({
        error: 'Modello AI non supportato.',
        code: 'UNSUPPORTED_MODEL',
        suggestedAction: 'Ricarica la pagina e riprova'
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Setup timeout handler
    timeoutId = setTimeout(() => {
      const timeoutError = {
        error: 'La richiesta sta impiegando troppo tempo.',
        code: 'REQUEST_TIMEOUT',
        suggestedAction: 'Riprova tra qualche minuto'
      };
      if (!res.headersSent) {
        res.status(504).json(timeoutError);
      } else {
        res.write(`data: ${JSON.stringify(timeoutError)}\n\n`);
        res.end();
      }
    }, TIMEOUT_MS);

    // Request completion from OpenAI with timeout protection
    const stream = await Promise.race([
      openai.chat.completions.create({
        model,
        messages: sanitizedMessages,
        stream: true,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI API timeout')), TIMEOUT_MS)
      )
    ]);

    // Clear timeout once stream starts
    clearTimeout(timeoutId);

    // Process stream chunks
    for await (const chunk of stream) {
      // Validate chunk structure
      if (!chunk || !chunk.choices || !Array.isArray(chunk.choices)) {
        console.error('Invalid chunk structure:', chunk);
        continue;
      }

      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        const sanitizedContent = sanitizeHTML(content);
        res.write(`data: ${JSON.stringify({ content: sanitizedContent })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    // Clear timeout on error
    if (timeoutId) clearTimeout(timeoutId);

    console.error('Error in chat endpoint:', error);

    // Capture error in Sentry with context
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          endpoint: 'chat',
          model: req.body?.model || 'unknown'
        },
        extra: {
          messageCount: req.body?.messages?.length || 0,
          errorCode: error.code,
          errorStatus: error.status
        }
      });
    }

    // Handle specific error types with user-friendly messages
    let errorResponse = {
      error: 'Si è verificato un errore. Riprova più tardi.',
      code: 'INTERNAL_ERROR',
      suggestedAction: 'Contatta il supporto se il problema persiste'
    };
    let statusCode = 500;

    if (error.message === 'OpenAI API timeout') {
      errorResponse = {
        error: 'La richiesta al servizio AI sta impiegando troppo tempo.',
        code: 'AI_SERVICE_TIMEOUT',
        suggestedAction: 'Riprova tra qualche minuto'
      };
      statusCode = 504;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      errorResponse = {
        error: 'Impossibile connettersi al servizio AI.',
        code: 'AI_SERVICE_UNAVAILABLE',
        suggestedAction: 'Verifica la tua connessione e riprova'
      };
      statusCode = 503;
    } else if (error.status === 401) {
      errorResponse = {
        error: 'Errore di autenticazione con il servizio AI.',
        code: 'AI_AUTH_ERROR',
        suggestedAction: 'Il problema è stato segnalato al nostro team'
      };
      statusCode = 500;
    } else if (error.status === 429) {
      errorResponse = {
        error: 'Il servizio AI ha raggiunto il limite di richieste.',
        code: 'AI_RATE_LIMIT',
        suggestedAction: 'Riprova tra qualche minuto'
      };
      statusCode = 429;
    } else if (error.status === 400) {
      errorResponse = {
        error: 'Richiesta non valida al servizio AI.',
        code: 'AI_INVALID_REQUEST',
        suggestedAction: 'Modifica il messaggio e riprova'
      };
      statusCode = 400;
    } else if (error.status >= 500) {
      errorResponse = {
        error: 'Il servizio AI ha riscontrato un problema.',
        code: 'AI_SERVICE_ERROR',
        suggestedAction: 'Riprova tra qualche secondo'
      };
      statusCode = 502;
    }

    if (!res.headersSent) {
      res.status(statusCode).json(errorResponse);
    } else {
      res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
      res.end();
    }
  }
});

// Sentry error handler must be before any other error middleware and after all controllers
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Optional fallthrough error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // User-friendly error response
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: err.message || 'Si è verificato un errore imprevisto.',
    code: err.code || 'UNHANDLED_ERROR',
    suggestedAction: 'Riprova o contatta il supporto se il problema persiste'
  };

  res.status(statusCode).json(errorResponse);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

export default app;
