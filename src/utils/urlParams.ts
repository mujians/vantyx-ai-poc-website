import type { PromptCategory } from '../components/ui/MicroPrompts';

interface URLPromptConfig {
  category?: PromptCategory;
  autoTrigger?: boolean;
  prompt?: string;
}

/**
 * Estrae e valida i parametri URL per i microprompt
 * @param searchParams - URLSearchParams object
 * @returns Configurazione validata dei parametri URL
 */
export function parseURLParams(searchParams: URLSearchParams): URLPromptConfig {
  const config: URLPromptConfig = {};

  // Estrai categoria
  const category = searchParams.get('category');
  if (category && isValidCategory(category)) {
    config.category = category as PromptCategory;
  }

  // Estrai flag auto-trigger
  const autoTrigger = searchParams.get('autoTrigger');
  if (autoTrigger === 'true' || autoTrigger === '1') {
    config.autoTrigger = true;
  }

  // Estrai prompt specifico
  const prompt = searchParams.get('prompt');
  if (prompt && prompt.trim()) {
    config.prompt = decodeURIComponent(prompt.trim());
  }

  return config;
}

/**
 * Valida se una stringa è una categoria valida
 */
function isValidCategory(value: string): boolean {
  return ['prospect', 'partner', 'investitori'].includes(value);
}

/**
 * Applica la configurazione URL ai microprompt
 * @param config - Configurazione estratta dall'URL
 * @param onPromptTrigger - Callback per triggerare un prompt
 * @returns Categoria attiva da applicare
 */
export function applyURLConfig(
  config: URLPromptConfig,
  onPromptTrigger?: (prompt: string) => void
): PromptCategory | 'all' {
  // Se c'è un prompt specifico e auto-trigger è attivo, triggera il prompt
  if (config.autoTrigger && config.prompt && onPromptTrigger) {
    // Usa setTimeout per assicurarsi che il componente sia montato
    setTimeout(() => {
      onPromptTrigger(config.prompt!);
    }, 100);
  }

  // Ritorna la categoria da applicare ai filtri
  return config.category || 'all';
}

/**
 * Crea un URL con parametri per i microprompt
 * @param baseUrl - URL base
 * @param category - Categoria opzionale
 * @param prompt - Prompt opzionale da auto-triggerare
 * @param autoTrigger - Se true, il prompt verrà triggerato automaticamente
 */
export function buildPromptURL(
  baseUrl: string,
  options: {
    category?: PromptCategory;
    prompt?: string;
    autoTrigger?: boolean;
  }
): string {
  const url = new URL(baseUrl);

  if (options.category) {
    url.searchParams.set('category', options.category);
  }

  if (options.prompt) {
    url.searchParams.set('prompt', encodeURIComponent(options.prompt));

    if (options.autoTrigger) {
      url.searchParams.set('autoTrigger', 'true');
    }
  }

  return url.toString();
}

/**
 * Hook React per gestire i parametri URL
 * Esempio d'uso:
 *
 * const { category, shouldAutoTrigger, triggerPrompt } = useURLParams();
 *
 * useEffect(() => {
 *   if (shouldAutoTrigger && triggerPrompt) {
 *     handlePromptClick(triggerPrompt);
 *   }
 * }, [shouldAutoTrigger, triggerPrompt]);
 */
export function useURLParams() {
  if (typeof window === 'undefined') {
    return {
      category: 'all' as const,
      shouldAutoTrigger: false,
      triggerPrompt: null,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const config = parseURLParams(searchParams);

  return {
    category: config.category || ('all' as const),
    shouldAutoTrigger: config.autoTrigger || false,
    triggerPrompt: config.prompt || null,
  };
}
