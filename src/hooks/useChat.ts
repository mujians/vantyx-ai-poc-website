import { useState, useCallback } from 'react';
import vantyxContent from '../../vantyx_content.json';
import { sanitizeText, sanitizeHTML, sanitizeJSON } from '../utils/sanitize';
import { formatErrorMessage, createUserFriendlyError } from '../utils/errorMessages';

const CACHE_KEY = 'vantyx_chat_cache';
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedResponse {
  question: string;
  answer: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
}

// Helper functions for localStorage cache
const normalizeQuestion = (question: string): string => {
  return question.trim().toLowerCase().replace(/[?.!,]/g, '');
};

const getCachedResponse = (question: string): string | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cache = sanitizeJSON<CachedResponse[]>(cached);
    if (!cache || !Array.isArray(cache)) return null;

    const normalizedQuestion = normalizeQuestion(question);
    const now = Date.now();

    const match = cache.find(
      (item) =>
        normalizeQuestion(item.question) === normalizedQuestion &&
        now - item.timestamp < CACHE_EXPIRATION_MS
    );

    return match ? sanitizeHTML(match.answer) : null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const saveCachedResponse = (question: string, answer: string): void => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    let cache: CachedResponse[] = cached ? JSON.parse(cached) : [];

    // Remove expired entries
    const now = Date.now();
    cache = cache.filter((item) => now - item.timestamp < CACHE_EXPIRATION_MS);

    // Remove old entry if question already exists
    const normalizedQuestion = normalizeQuestion(question);
    cache = cache.filter((item) => normalizeQuestion(item.question) !== normalizedQuestion);

    // Add new entry
    cache.push({
      question: question.trim(),
      answer,
      timestamp: now,
    });

    // Limit cache size to 100 entries
    if (cache.length > 100) {
      cache = cache.slice(-100);
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
};

// Knowledge base integration
const buildKnowledgeBaseContext = (): string => {
  const topics = vantyxContent.topics
    .map(
      (topic) =>
        `**${topic.title}**\n${topic.description}\nKeywords: ${topic.keywords.join(', ')}`
    )
    .join('\n\n');

  return `You are Vantyx AI Assistant. Use this knowledge base to answer questions about Vantyx:

${topics}

Always answer in Italian, be professional and concise. Focus on the value proposition and real-world benefits.`;
};

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const sanitizedContent = sanitizeText(content);
    if (!sanitizedContent.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: sanitizedContent.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Check cache first
    const cachedAnswer = getCachedResponse(sanitizedContent.trim());
    if (cachedAnswer) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cachedAnswer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      return;
    }

    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const attemptFetch = async (retryCount = 0): Promise<void> => {
      try {
        // Check if user is offline before attempting request
        if (!navigator.onLine) {
          const errorDetails = createUserFriendlyError('Nessuna connessione Internet disponibile');
          throw new Error(formatErrorMessage(errorDetails));
        }

        // Convert messages to OpenAI format, limiting to last 10 messages
        const MAX_MESSAGES = 10;
        const recentMessages = messages.slice(-MAX_MESSAGES);

        // Build knowledge base context as system message
        const knowledgeBaseContext = buildKnowledgeBaseContext();

        const openaiMessages = [
          {
            role: 'system' as const,
            content: knowledgeBaseContext,
          },
          ...recentMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ];

        // Add current user message
        openaiMessages.push({
          role: 'user',
          content: sanitizedContent.trim(),
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: openaiMessages,
            model: 'gpt-3.5-turbo',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // Use server-provided error message if available, otherwise create generic one
          const errorMessage = errorData.error || `Errore ${response.status}`;
          const errorDetails = createUserFriendlyError(errorMessage);
          throw new Error(formatErrorMessage(errorDetails));
        }

        // Handle SSE streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        if (!reader) {
          const errorDetails = createUserFriendlyError('Impossibile leggere la risposta dal server');
          throw new Error(formatErrorMessage(errorDetails));
        }

        const assistantMessageId = (Date.now() + 1).toString();
        setIsStreaming(true);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  const sanitizedChunk = sanitizeHTML(parsed.content);
                  assistantContent += sanitizedChunk;

                  // Update message in real-time
                  setMessages((prev) => {
                    const existingIndex = prev.findIndex((msg) => msg.id === assistantMessageId);
                    const assistantMessage: Message = {
                      id: assistantMessageId,
                      role: 'assistant',
                      content: assistantContent,
                      timestamp: new Date(),
                    };

                    if (existingIndex >= 0) {
                      const updated = [...prev];
                      updated[existingIndex] = assistantMessage;
                      return updated;
                    } else {
                      return [...prev, assistantMessage];
                    }
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        setIsStreaming(false);

        // Save to cache if we have a complete response
        if (assistantContent.trim()) {
          saveCachedResponse(sanitizedContent.trim(), assistantContent);
        }
      } catch (err) {
        setIsStreaming(false);
        if (retryCount < MAX_RETRIES - 1) {
          const delay = RETRY_DELAYS[retryCount];
          console.log(`Retry attempt ${retryCount + 1} after ${delay}ms`);
          await sleep(delay);
          return attemptFetch(retryCount + 1);
        } else {
          throw err;
        }
      }
    };

    try {
      await attemptFetch();
    } catch (err) {
      // Create user-friendly error message
      const errorDetails = createUserFriendlyError(err);
      const errorMessage = formatErrorMessage(errorDetails);
      setError(errorMessage);
      console.error('Chat error after retries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    resetChat,
  };
};
