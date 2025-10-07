import DOMPurify from 'isomorphic-dompurify';

/**
 * Configurazione DOMPurify per sanitizzazione sicura
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
};

/**
 * Sanitizza input HTML usando DOMPurify
 * @param dirty - Stringa potenzialmente pericolosa
 * @returns Stringa sanitizzata sicura per il rendering
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(dirty, SANITIZE_CONFIG);
}

/**
 * Sanitizza testo semplice rimuovendo tag HTML
 * @param input - Stringa di input
 * @returns Stringa senza tag HTML
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  // Rimuove tutti i tag HTML
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], KEEP_CONTENT: true });
}

/**
 * Valida e sanitizza email
 * @param email - Email da validare
 * @returns Email sanitizzata o stringa vuota se non valida
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  const sanitized = sanitizeText(email.trim().toLowerCase());
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitizza URL verificando che sia sicuro
 * @param url - URL da sanitizzare
 * @returns URL sanitizzato o stringa vuota se non valido
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  const sanitized = url.trim();
  try {
    const parsed = new URL(sanitized);
    // Permetti solo protocolli sicuri
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return sanitized;
    }
  } catch {
    return '';
  }
  return '';
}

/**
 * Sanitizza input numerico
 * @param input - Input da convertire in numero
 * @returns Numero sanitizzato o null se non valido
 */
export function sanitizeNumber(input: string | number): number | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const num = typeof input === 'number' ? input : parseFloat(String(input));
  return !isNaN(num) && isFinite(num) ? num : null;
}

/**
 * Sanitizza oggetti JSON da localStorage
 * @param json - Stringa JSON da parsare
 * @returns Oggetto parsato o null se non valido
 */
export function sanitizeJSON<T>(json: string): T | null {
  if (!json || typeof json !== 'string') {
    return null;
  }
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
