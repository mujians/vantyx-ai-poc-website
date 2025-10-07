import type { MicroPrompt } from '../components/chat/MicroPrompts';

/**
 * Analizza i messaggi della conversazione per determinare il contesto
 */
export function analyzeConversationContext(messages: Array<{ role: string; content: string }>): string[] {
  const contexts: Set<string> = new Set();

  // Analizza gli ultimi messaggi per identificare i temi
  const recentMessages = messages.slice(-5);
  const combinedText = recentMessages
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Identifica i contesti basandosi sulle parole chiave
  if (combinedText.match(/\b(api|endpoint|rest|graphql|integration)\b/)) {
    contexts.add('api');
  }

  if (combinedText.match(/\b(deploy|deployment|hosting|production|server)\b/)) {
    contexts.add('deployment');
  }

  if (combinedText.match(/\b(test|testing|unit test|integration test|qa)\b/)) {
    contexts.add('testing');
  }

  if (combinedText.match(/\b(performance|optimize|optimization|speed|slow)\b/)) {
    contexts.add('performance');
  }

  if (combinedText.match(/\b(security|auth|authentication|authorization|secure)\b/)) {
    contexts.add('security');
  }

  if (combinedText.match(/\b(ui|ux|design|interface|component|react)\b/)) {
    contexts.add('ui');
  }

  if (combinedText.match(/\b(database|db|sql|query|data model)\b/)) {
    contexts.add('database');
  }

  if (combinedText.match(/\b(error|bug|issue|problem|fix)\b/)) {
    contexts.add('debugging');
  }

  if (combinedText.match(/\b(architecture|structure|design pattern|refactor)\b/)) {
    contexts.add('architecture');
  }

  if (combinedText.match(/\b(documentation|docs|readme|comment)\b/)) {
    contexts.add('documentation');
  }

  return Array.from(contexts);
}

/**
 * Microprompt contestuali per diversi scenari
 */
const contextualPromptsByCategory: Record<string, MicroPrompt[]> = {
  api: [
    { id: 'ctx-api-1', text: 'Come gestire gli errori API?', category: 'development' },
    { id: 'ctx-api-2', text: 'Best practices per REST API', category: 'development' },
    { id: 'ctx-api-3', text: 'Come implementare rate limiting?', category: 'development' },
    { id: 'ctx-api-4', text: 'Autenticazione API con JWT', category: 'development' },
  ],

  deployment: [
    { id: 'ctx-deploy-1', text: 'Come fare il deploy su Vercel?', category: 'deployment' },
    { id: 'ctx-deploy-2', text: 'Configurare CI/CD pipeline', category: 'deployment' },
    { id: 'ctx-deploy-3', text: 'Environment variables best practices', category: 'deployment' },
    { id: 'ctx-deploy-4', text: 'Rollback strategy', category: 'deployment' },
  ],

  testing: [
    { id: 'ctx-test-1', text: 'Scrivere unit test efficaci', category: 'development' },
    { id: 'ctx-test-2', text: 'Test coverage recommendations', category: 'development' },
    { id: 'ctx-test-3', text: 'Mocking e stubbing best practices', category: 'development' },
    { id: 'ctx-test-4', text: 'E2E testing setup', category: 'development' },
  ],

  performance: [
    { id: 'ctx-perf-1', text: 'Ottimizzare bundle size', category: 'optimization' },
    { id: 'ctx-perf-2', text: 'Lazy loading components', category: 'optimization' },
    { id: 'ctx-perf-3', text: 'Caching strategies', category: 'optimization' },
    { id: 'ctx-perf-4', text: 'Performance monitoring tools', category: 'optimization' },
  ],

  security: [
    { id: 'ctx-sec-1', text: 'Protezione da XSS attacks', category: 'development' },
    { id: 'ctx-sec-2', text: 'CORS configuration', category: 'development' },
    { id: 'ctx-sec-3', text: 'Secure password storage', category: 'development' },
    { id: 'ctx-sec-4', text: 'Input validation best practices', category: 'development' },
  ],

  ui: [
    { id: 'ctx-ui-1', text: 'Responsive design tips', category: 'design' },
    { id: 'ctx-ui-2', text: 'Accessibility best practices', category: 'design' },
    { id: 'ctx-ui-3', text: 'Component composition patterns', category: 'development' },
    { id: 'ctx-ui-4', text: 'State management solutions', category: 'development' },
  ],

  database: [
    { id: 'ctx-db-1', text: 'Database indexing strategies', category: 'development' },
    { id: 'ctx-db-2', text: 'Query optimization tips', category: 'optimization' },
    { id: 'ctx-db-3', text: 'Database migration best practices', category: 'development' },
    { id: 'ctx-db-4', text: 'Connection pooling setup', category: 'development' },
  ],

  debugging: [
    { id: 'ctx-debug-1', text: 'Debugging tools e tecniche', category: 'development' },
    { id: 'ctx-debug-2', text: 'Error logging best practices', category: 'development' },
    { id: 'ctx-debug-3', text: 'Source maps configuration', category: 'development' },
    { id: 'ctx-debug-4', text: 'Browser DevTools tips', category: 'development' },
  ],

  architecture: [
    { id: 'ctx-arch-1', text: 'Microservices vs Monolith', category: 'development' },
    { id: 'ctx-arch-2', text: 'Clean architecture principles', category: 'development' },
    { id: 'ctx-arch-3', text: 'Design patterns comuni', category: 'development' },
    { id: 'ctx-arch-4', text: 'Separation of concerns', category: 'development' },
  ],

  documentation: [
    { id: 'ctx-doc-1', text: 'Come scrivere buona documentazione', category: 'general' },
    { id: 'ctx-doc-2', text: 'JSDoc best practices', category: 'development' },
    { id: 'ctx-doc-3', text: 'API documentation tools', category: 'development' },
    { id: 'ctx-doc-4', text: 'README structure', category: 'general' },
  ],
};

/**
 * Microprompt generici di fallback
 */
const fallbackPrompts: MicroPrompt[] = [
  { id: 'ctx-fallback-1', text: 'Come strutturare il progetto?', category: 'development' },
  { id: 'ctx-fallback-2', text: 'Best practices per il codice', category: 'development' },
  { id: 'ctx-fallback-3', text: 'Come migliorare la performance?', category: 'optimization' },
  { id: 'ctx-fallback-4', text: 'Debugging tips', category: 'development' },
  { id: 'ctx-fallback-5', text: 'Testing strategies', category: 'development' },
  { id: 'ctx-fallback-6', text: 'Security considerations', category: 'development' },
  { id: 'ctx-fallback-7', text: 'Deployment best practices', category: 'deployment' },
  { id: 'ctx-fallback-8', text: 'Code review checklist', category: 'development' },
  { id: 'ctx-fallback-9', text: 'Documentazione del codice', category: 'general' },
  { id: 'ctx-fallback-10', text: 'Refactoring techniques', category: 'development' },
];

/**
 * Genera microprompt contestuali basati sulla conversazione
 */
export function getContextualPrompts(
  messages: Array<{ role: string; content: string }>,
  count: number = 10
): MicroPrompt[] {
  // Analizza il contesto della conversazione
  const contexts = analyzeConversationContext(messages);

  const selectedPrompts: MicroPrompt[] = [];
  const usedIds = new Set<string>();

  // Raccogli prompt da tutti i contesti identificati
  for (const context of contexts) {
    const contextPrompts = contextualPromptsByCategory[context] || [];

    for (const prompt of contextPrompts) {
      if (!usedIds.has(prompt.id) && selectedPrompts.length < count) {
        selectedPrompts.push(prompt);
        usedIds.add(prompt.id);
      }
    }

    if (selectedPrompts.length >= count) break;
  }

  // Se non abbiamo abbastanza prompt, aggiungi prompt di fallback
  if (selectedPrompts.length < count) {
    const shuffledFallback = [...fallbackPrompts].sort(() => Math.random() - 0.5);

    for (const prompt of shuffledFallback) {
      if (!usedIds.has(prompt.id) && selectedPrompts.length < count) {
        selectedPrompts.push(prompt);
        usedIds.add(prompt.id);
      }
    }
  }

  // Mescola i prompt selezionati per variare l'ordine
  return selectedPrompts.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Determina se mostrare i microprompt contestuali
 */
export function shouldShowContextualPrompts(messageCount: number): boolean {
  // Mostra dopo 2-3 messaggi
  return messageCount >= 2 && messageCount <= 3;
}
