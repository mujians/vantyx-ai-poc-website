import { MicroPrompt } from '../components/ui/MicroPrompts';

/**
 * Initial micro-prompts shown to new users
 * These prompts are designed to guide first-time visitors and showcase key features
 */
export const initialPrompts: MicroPrompt[] = [
  {
    id: 'initial-1',
    text: 'Cosa offre Vantyx?',
    category: 'prospect',
  },
  {
    id: 'initial-2',
    text: 'Come posso diventare partner?',
    category: 'partner',
  },
  {
    id: 'initial-3',
    text: 'Quali sono i vostri servizi?',
    category: 'prospect',
  },
  {
    id: 'initial-4',
    text: 'Opportunità di investimento',
    category: 'investitori',
  },
  {
    id: 'initial-5',
    text: 'Chi è il team di Vantyx?',
    category: 'prospect',
  },
];

/**
 * Get initial prompts for new users
 * @returns Array of initial micro-prompts
 */
export const getInitialPrompts = (): MicroPrompt[] => {
  return initialPrompts;
};

/**
 * Check if user is a first-time visitor
 * @returns true if user has never visited before
 */
export const isFirstTimeUser = (): boolean => {
  const hasVisited = localStorage.getItem('vantyx_has_visited');
  return !hasVisited;
};

/**
 * Mark user as having visited the site
 */
export const markUserAsVisited = (): void => {
  localStorage.setItem('vantyx_has_visited', 'true');
};

/**
 * Get prompts to display based on user status
 * Returns initial prompts for first-time users, empty array otherwise
 * @returns Array of micro-prompts to display
 */
export const getPromptsForUser = (): MicroPrompt[] => {
  if (isFirstTimeUser()) {
    return getInitialPrompts();
  }
  return [];
};
