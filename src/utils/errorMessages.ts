/**
 * User-friendly error messages utility
 * Converts technical errors into user-friendly messages
 */

export interface ErrorDetails {
  userMessage: string;
  technicalMessage?: string;
  suggestedAction?: string;
  errorCode?: string;
}

/**
 * Network-related errors
 */
export const NetworkErrors = {
  CONNECTION_FAILED: {
    userMessage: 'Impossibile connettersi al server. Verifica la tua connessione internet.',
    suggestedAction: 'Riprova tra qualche secondo',
    errorCode: 'NET_001'
  },
  TIMEOUT: {
    userMessage: 'La richiesta sta impiegando troppo tempo. Il server potrebbe essere sovraccarico.',
    suggestedAction: 'Riprova tra qualche minuto',
    errorCode: 'NET_002'
  },
  SERVER_UNAVAILABLE: {
    userMessage: 'Il servizio è temporaneamente non disponibile.',
    suggestedAction: 'Riprova più tardi',
    errorCode: 'NET_003'
  },
  NO_RESPONSE: {
    userMessage: 'Nessuna risposta dal server.',
    suggestedAction: 'Verifica la tua connessione e riprova',
    errorCode: 'NET_004'
  },
  OFFLINE: {
    userMessage: 'Nessuna connessione Internet disponibile.',
    suggestedAction: 'Verifica la tua connessione e riprova',
    errorCode: 'NET_005'
  }
} as const;

/**
 * API-related errors
 */
export const APIErrors = {
  RATE_LIMIT_EXCEEDED: {
    userMessage: 'Hai inviato troppe richieste. Per favore, attendi prima di riprovare.',
    suggestedAction: 'Riprova tra qualche minuto',
    errorCode: 'API_001'
  },
  INVALID_REQUEST: {
    userMessage: 'I dati inviati non sono validi.',
    suggestedAction: 'Verifica il messaggio e riprova',
    errorCode: 'API_002'
  },
  AUTHENTICATION_FAILED: {
    userMessage: 'Errore di autenticazione con il servizio.',
    suggestedAction: 'Il problema è stato segnalato al nostro team',
    errorCode: 'API_003'
  },
  SERVICE_ERROR: {
    userMessage: 'Il servizio AI ha riscontrato un problema.',
    suggestedAction: 'Riprova tra qualche secondo',
    errorCode: 'API_004'
  },
  CONTENT_TOO_LONG: {
    userMessage: 'Il messaggio è troppo lungo.',
    suggestedAction: 'Riduci la lunghezza del messaggio e riprova',
    errorCode: 'API_005'
  }
} as const;

/**
 * Validation errors
 */
export const ValidationErrors = {
  EMPTY_MESSAGE: {
    userMessage: 'Il messaggio non può essere vuoto.',
    suggestedAction: 'Scrivi un messaggio e riprova',
    errorCode: 'VAL_001'
  },
  INVALID_FORMAT: {
    userMessage: 'Il formato del messaggio non è valido.',
    suggestedAction: 'Verifica il contenuto e riprova',
    errorCode: 'VAL_002'
  },
  INVALID_EMAIL: {
    userMessage: 'L\'indirizzo email non è valido.',
    suggestedAction: 'Inserisci un indirizzo email corretto',
    errorCode: 'VAL_003'
  },
  UNSAFE_CONTENT: {
    userMessage: 'Il contenuto inserito contiene caratteri non permessi.',
    suggestedAction: 'Rimuovi caratteri speciali e riprova',
    errorCode: 'VAL_004'
  }
} as const;

/**
 * General errors
 */
export const GeneralErrors = {
  UNKNOWN: {
    userMessage: 'Si è verificato un errore imprevisto.',
    suggestedAction: 'Riprova o contatta il supporto se il problema persiste',
    errorCode: 'GEN_001'
  },
  NOT_FOUND: {
    userMessage: 'Risorsa non trovata.',
    suggestedAction: 'Verifica l\'indirizzo e riprova',
    errorCode: 'GEN_002'
  },
  PERMISSION_DENIED: {
    userMessage: 'Non hai i permessi per eseguire questa operazione.',
    suggestedAction: 'Contatta il supporto per assistenza',
    errorCode: 'GEN_003'
  }
} as const;

/**
 * Maps HTTP status codes to user-friendly error messages
 */
export const getErrorByStatus = (status: number): ErrorDetails => {
  switch (status) {
    case 400:
      return APIErrors.INVALID_REQUEST;
    case 401:
    case 403:
      return GeneralErrors.PERMISSION_DENIED;
    case 404:
      return GeneralErrors.NOT_FOUND;
    case 429:
      return APIErrors.RATE_LIMIT_EXCEEDED;
    case 500:
    case 502:
    case 503:
      return NetworkErrors.SERVER_UNAVAILABLE;
    case 504:
      return NetworkErrors.TIMEOUT;
    default:
      return GeneralErrors.UNKNOWN;
  }
};

/**
 * Maps error messages from server to user-friendly messages
 */
export const mapServerError = (errorMessage: string): ErrorDetails => {
  const lowerMessage = errorMessage.toLowerCase();

  // Network errors
  if (lowerMessage.includes('offline') || lowerMessage.includes('nessuna connessione internet')) {
    return NetworkErrors.OFFLINE;
  }
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return NetworkErrors.TIMEOUT;
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return NetworkErrors.CONNECTION_FAILED;
  }
  if (lowerMessage.includes('unavailable') || lowerMessage.includes('service error')) {
    return NetworkErrors.SERVER_UNAVAILABLE;
  }

  // API errors
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return APIErrors.RATE_LIMIT_EXCEEDED;
  }
  if (lowerMessage.includes('authentication') || lowerMessage.includes('api key')) {
    return APIErrors.AUTHENTICATION_FAILED;
  }
  if (lowerMessage.includes('too long') || lowerMessage.includes('maximum')) {
    return APIErrors.CONTENT_TOO_LONG;
  }
  if (lowerMessage.includes('invalid request') || lowerMessage.includes('bad request')) {
    return APIErrors.INVALID_REQUEST;
  }

  // Validation errors
  if (lowerMessage.includes('empty') || lowerMessage.includes('required')) {
    return ValidationErrors.EMPTY_MESSAGE;
  }
  if (lowerMessage.includes('invalid format')) {
    return ValidationErrors.INVALID_FORMAT;
  }
  if (lowerMessage.includes('email')) {
    return ValidationErrors.INVALID_EMAIL;
  }

  // Default to unknown error
  return {
    ...GeneralErrors.UNKNOWN,
    technicalMessage: errorMessage
  };
};

/**
 * Formats an error for display to the user
 */
export const formatErrorMessage = (error: ErrorDetails): string => {
  let message = error.userMessage;
  if (error.suggestedAction) {
    message += ` ${error.suggestedAction}.`;
  }
  return message;
};

/**
 * Creates a user-friendly error from various error types
 */
export const createUserFriendlyError = (
  error: unknown,
  defaultMessage?: string
): ErrorDetails => {
  // If it's already an ErrorDetails object
  if (error && typeof error === 'object' && 'userMessage' in error) {
    return error as ErrorDetails;
  }

  // If it's an Error object
  if (error instanceof Error) {
    return mapServerError(error.message);
  }

  // If it's a string
  if (typeof error === 'string') {
    return mapServerError(error);
  }

  // If it's a fetch response error with status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return getErrorByStatus(status);
  }

  // Default error
  return {
    userMessage: defaultMessage || GeneralErrors.UNKNOWN.userMessage,
    suggestedAction: GeneralErrors.UNKNOWN.suggestedAction,
    errorCode: GeneralErrors.UNKNOWN.errorCode
  };
};

/**
 * Logs error for debugging while showing user-friendly message
 */
export const handleError = (
  error: unknown,
  context?: string
): ErrorDetails => {
  const userFriendlyError = createUserFriendlyError(error);

  // Log technical details for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
      original: error,
      userFriendly: userFriendlyError
    });
  }

  return userFriendlyError;
};
