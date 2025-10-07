"""
Feedback UI Implementation - React Component
=============================================

Implementazione dell'interfaccia utente per la raccolta del feedback (👍/👎)
con integrazione Plausible Analytics.

Questo file contiene:
1. Componente React per feedback thumbs up/down
2. Hook personalizzato per gestione stato feedback
3. Integrazione con Plausible Analytics per tracking
4. Stili Tailwind CSS per UI responsive
"""

# ============================================================================
# COMPONENTE REACT: FeedbackButtons.tsx
# ============================================================================

FEEDBACK_BUTTONS_COMPONENT = """
import React, { useState, useCallback } from 'react';

// Tipo per stato feedback
type FeedbackType = 'positive' | 'negative' | null;

interface FeedbackButtonsProps {
  messageId: string;
  onFeedbackSubmit?: (messageId: string, feedbackType: FeedbackType) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Componente per raccolta feedback thumbs up/down
 * Traccia eventi con Plausible Analytics
 */
export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  messageId,
  onFeedbackSubmit,
  className = '',
  disabled = false,
}) => {
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Invia feedback a Plausible Analytics
   */
  const trackFeedback = useCallback((type: FeedbackType) => {
    if (typeof window !== 'undefined' && window.plausible) {
      try {
        window.plausible('Feedback Submitted', {
          props: {
            feedbackType: type,
            messageId: messageId,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error tracking feedback:', error);
      }
    }
  }, [messageId]);

  /**
   * Gestisce click su pulsante feedback
   */
  const handleFeedbackClick = useCallback(async (type: FeedbackType) => {
    if (disabled || isSubmitting || feedback === type) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Aggiorna stato locale
      setFeedback(type);

      // Traccia evento analytics
      trackFeedback(type);

      // Callback opzionale per gestione esterna
      if (onFeedbackSubmit) {
        onFeedbackSubmit(messageId, type);
      }

      // Salva feedback in localStorage per persistenza
      saveFeedbackToStorage(messageId, type);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [messageId, feedback, disabled, isSubmitting, trackFeedback, onFeedbackSubmit]);

  return (
    <div className={\`flex items-center gap-2 \${className}\`}>
      <span className="text-sm text-gray-600">È stata utile questa risposta?</span>

      {/* Thumbs Up Button */}
      <button
        onClick={() => handleFeedbackClick('positive')}
        disabled={disabled || isSubmitting}
        className={\`
          p-2 rounded-lg transition-all duration-200
          \${feedback === 'positive'
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          \${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
        \`}
        aria-label="Feedback positivo"
        title="Risposta utile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      </button>

      {/* Thumbs Down Button */}
      <button
        onClick={() => handleFeedbackClick('negative')}
        disabled={disabled || isSubmitting}
        className={\`
          p-2 rounded-lg transition-all duration-200
          \${feedback === 'negative'
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          \${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
        \`}
        aria-label="Feedback negativo"
        title="Risposta non utile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
      </button>

      {/* Messaggio di conferma */}
      {feedback && (
        <span className="text-sm text-gray-500 animate-fade-in">
          Grazie per il feedback!
        </span>
      )}
    </div>
  );
};

/**
 * Salva feedback in localStorage per persistenza
 */
function saveFeedbackToStorage(messageId: string, feedbackType: FeedbackType): void {
  try {
    const STORAGE_KEY = 'vantyx_feedback';
    const stored = localStorage.getItem(STORAGE_KEY);
    const feedbackData = stored ? JSON.parse(stored) : {};

    feedbackData[messageId] = {
      type: feedbackType,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbackData));
  } catch (error) {
    console.error('Error saving feedback to storage:', error);
  }
}

/**
 * Carica feedback da localStorage
 */
export function loadFeedbackFromStorage(messageId: string): FeedbackType {
  try {
    const STORAGE_KEY = 'vantyx_feedback';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const feedbackData = JSON.parse(stored);
    return feedbackData[messageId]?.type || null;
  } catch (error) {
    console.error('Error loading feedback from storage:', error);
    return null;
  }
}

// Aggiungi tipo window.plausible per TypeScript
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}
"""


# ============================================================================
# HOOK PERSONALIZZATO: useFeedback.ts
# ============================================================================

USE_FEEDBACK_HOOK = """
import { useState, useEffect, useCallback } from 'react';

type FeedbackType = 'positive' | 'negative' | null;

interface FeedbackState {
  [messageId: string]: {
    type: FeedbackType;
    timestamp: string;
  };
}

interface UseFeedbackReturn {
  feedbacks: FeedbackState;
  getFeedback: (messageId: string) => FeedbackType;
  setFeedback: (messageId: string, type: FeedbackType) => void;
  clearFeedback: (messageId: string) => void;
  clearAllFeedbacks: () => void;
  getFeedbackStats: () => { positive: number; negative: number; total: number };
}

const STORAGE_KEY = 'vantyx_feedback';

/**
 * Hook personalizzato per gestione feedback
 * Gestisce stato, persistenza localStorage e statistiche
 */
export const useFeedback = (): UseFeedbackReturn => {
  const [feedbacks, setFeedbacks] = useState<FeedbackState>({});

  // Carica feedback da localStorage all'init
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFeedbacks(parsed);
      }
    } catch (error) {
      console.error('Error loading feedbacks from storage:', error);
    }
  }, []);

  // Ottieni feedback per messaggio specifico
  const getFeedback = useCallback((messageId: string): FeedbackType => {
    return feedbacks[messageId]?.type || null;
  }, [feedbacks]);

  // Imposta feedback per messaggio
  const setFeedback = useCallback((messageId: string, type: FeedbackType) => {
    setFeedbacks((prev) => {
      const updated = {
        ...prev,
        [messageId]: {
          type,
          timestamp: new Date().toISOString(),
        },
      };

      // Salva in localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving feedback to storage:', error);
      }

      return updated;
    });

    // Traccia evento in Plausible
    if (typeof window !== 'undefined' && window.plausible) {
      try {
        window.plausible('Feedback Submitted', {
          props: {
            feedbackType: type,
            messageId,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error tracking feedback:', error);
      }
    }
  }, []);

  // Rimuovi feedback per messaggio specifico
  const clearFeedback = useCallback((messageId: string) => {
    setFeedbacks((prev) => {
      const updated = { ...prev };
      delete updated[messageId];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error clearing feedback from storage:', error);
      }

      return updated;
    });
  }, []);

  // Rimuovi tutti i feedback
  const clearAllFeedbacks = useCallback(() => {
    setFeedbacks({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing all feedbacks from storage:', error);
    }
  }, []);

  // Calcola statistiche feedback
  const getFeedbackStats = useCallback(() => {
    const stats = {
      positive: 0,
      negative: 0,
      total: 0,
    };

    Object.values(feedbacks).forEach((feedback) => {
      if (feedback.type === 'positive') {
        stats.positive++;
      } else if (feedback.type === 'negative') {
        stats.negative++;
      }
      stats.total++;
    });

    return stats;
  }, [feedbacks]);

  return {
    feedbacks,
    getFeedback,
    setFeedback,
    clearFeedback,
    clearAllFeedbacks,
    getFeedbackStats,
  };
};

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}
"""


# ============================================================================
# COMPONENTE MESSAGGIO CON FEEDBACK: MessageWithFeedback.tsx
# ============================================================================

MESSAGE_WITH_FEEDBACK_COMPONENT = """
import React from 'react';
import { FeedbackButtons } from './FeedbackButtons';

interface MessageWithFeedbackProps {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  showFeedback?: boolean;
  onFeedbackSubmit?: (messageId: string, feedbackType: 'positive' | 'negative' | null) => void;
}

/**
 * Componente messaggio con pulsanti feedback integrati
 * Da utilizzare nella chat per mostrare messaggi dell'assistente con opzioni feedback
 */
export const MessageWithFeedback: React.FC<MessageWithFeedbackProps> = ({
  messageId,
  role,
  content,
  timestamp,
  showFeedback = true,
  onFeedbackSubmit,
}) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={\`flex \${isAssistant ? 'justify-start' : 'justify-end'} mb-4\`}>
      <div
        className={\`
          max-w-3/4 rounded-lg p-4 shadow-sm
          \${isAssistant
            ? 'bg-white border border-gray-200'
            : 'bg-blue-600 text-white'
          }
        \`}
      >
        {/* Contenuto messaggio */}
        <div className="prose prose-sm max-w-none">
          <p className={\`\${isAssistant ? 'text-gray-800' : 'text-white'}\`}>
            {content}
          </p>
        </div>

        {/* Timestamp */}
        <div className={\`text-xs mt-2 \${isAssistant ? 'text-gray-500' : 'text-blue-100'}\`}>
          {timestamp.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        {/* Pulsanti feedback solo per messaggi assistente */}
        {isAssistant && showFeedback && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <FeedbackButtons
              messageId={messageId}
              onFeedbackSubmit={onFeedbackSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
};
"""


# ============================================================================
# STILI CSS AGGIUNTIVI: feedback.css
# ============================================================================

FEEDBACK_CSS = """
/* Animazione fade-in per messaggio di conferma */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Hover effect per pulsanti feedback */
.feedback-button-hover {
  transition: all 0.2s ease-in-out;
}

.feedback-button-hover:hover:not(:disabled) {
  transform: scale(1.1);
}

.feedback-button-hover:active:not(:disabled) {
  transform: scale(0.95);
}

/* Focus visible per accessibilità */
.feedback-button-hover:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
"""


# ============================================================================
# CONFIGURAZIONE EVENTI PLAUSIBLE: feedback_events.json
# ============================================================================

PLAUSIBLE_EVENTS_CONFIG = {
  "events": {
    "feedbackSubmitted": {
      "name": "Feedback Submitted",
      "description": "Track quando utente invia feedback thumbs up/down",
      "implementation": "manual",
      "trigger": "Click su pulsante thumbs up o thumbs down",
      "props": {
        "feedbackType": "positive|negative",
        "messageId": "ID univoco del messaggio",
        "timestamp": "ISO timestamp dell'evento"
      },
      "code": "window.plausible('Feedback Submitted', { props: { feedbackType, messageId, timestamp } })"
    }
  },
  "customProps": {
    "feedbackType": ["positive", "negative"]
  },
  "goals": [
    {
      "name": "Feedback Submitted",
      "description": "User submits feedback on assistant response"
    }
  ]
}


# ============================================================================
# ESEMPIO DI INTEGRAZIONE: App.tsx
# ============================================================================

APP_INTEGRATION_EXAMPLE = """
import React from 'react';
import { useChat } from './hooks/useChat';
import { useFeedback } from './hooks/useFeedback';
import { MessageWithFeedback } from './components/MessageWithFeedback';

function App() {
  const { messages, sendMessage, isLoading } = useChat();
  const { setFeedback, getFeedbackStats } = useFeedback();

  const handleFeedbackSubmit = (messageId: string, feedbackType: 'positive' | 'negative' | null) => {
    setFeedback(messageId, feedbackType);
    console.log('Feedback submitted:', { messageId, feedbackType });
  };

  const stats = getFeedbackStats();
  console.log('Feedback stats:', stats);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header con statistiche feedback */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h1 className="text-2xl font-bold mb-2">Vantyx AI Chat</h1>
          <div className="text-sm text-gray-600">
            Feedback: {stats.positive} 👍 | {stats.negative} 👎 | Total: {stats.total}
          </div>
        </div>

        {/* Lista messaggi con feedback */}
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageWithFeedback
              key={message.id}
              messageId={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              showFeedback={message.role === 'assistant'}
              onFeedbackSubmit={handleFeedbackSubmit}
            />
          ))}
        </div>

        {/* Input messaggio */}
        {/* ... */}
      </div>
    </div>
  );
}

export default App;
"""


# ============================================================================
# ISTRUZIONI DI IMPLEMENTAZIONE
# ============================================================================

IMPLEMENTATION_INSTRUCTIONS = """
ISTRUZIONI PER L'IMPLEMENTAZIONE
=================================

1. CREARE I FILE COMPONENTI:

   a) src/components/ui/FeedbackButtons.tsx
      - Copiare il contenuto di FEEDBACK_BUTTONS_COMPONENT

   b) src/hooks/useFeedback.ts
      - Copiare il contenuto di USE_FEEDBACK_HOOK

   c) src/components/ui/MessageWithFeedback.tsx
      - Copiare il contenuto di MESSAGE_WITH_FEEDBACK_COMPONENT

2. AGGIUNGERE STILI CSS:

   - Creare src/styles/feedback.css
   - Copiare il contenuto di FEEDBACK_CSS
   - Importare in App.tsx: import './styles/feedback.css'

3. AGGIORNARE analytics-events.json:

   - Aggiungere configurazione eventi feedback da PLAUSIBLE_EVENTS_CONFIG

4. INTEGRARE NELL'APP:

   - Modificare App.tsx o componente chat principale
   - Importare FeedbackButtons e useFeedback hook
   - Vedere APP_INTEGRATION_EXAMPLE per riferimento

5. VERIFICARE PLAUSIBLE ANALYTICS:

   - Assicurarsi che lo script Plausible sia caricato in index.html
   - Verificare che window.plausible sia disponibile
   - Testare tracking eventi nel browser console

6. TESTING:

   - Testare click su thumbs up/down
   - Verificare persistenza in localStorage
   - Controllare eventi in Plausible dashboard
   - Testare accessibilità (keyboard navigation, screen reader)

7. ACCESSIBILITÀ:

   - I pulsanti hanno aria-label appropriati
   - Focus visibile con outline
   - Supporto navigazione da tastiera
   - Titoli descrittivi su hover

8. RESPONSIVE DESIGN:

   - UI responsive con Tailwind CSS
   - Pulsanti dimensionati correttamente su mobile
   - Touch-friendly (min 44x44px touch target)

FEATURE IMPLEMENTATE:
=====================

✅ Pulsanti thumbs up/down con icone SVG
✅ Stato visivo per feedback selezionato
✅ Animazioni hover e click
✅ Messaggio conferma dopo invio
✅ Tracking eventi Plausible Analytics
✅ Persistenza localStorage
✅ Hook personalizzato per gestione stato
✅ Statistiche feedback aggregate
✅ Accessibilità completa (WCAG 2.1)
✅ Responsive design mobile-first
✅ TypeScript type-safe
✅ Error handling robusto

EVENTI PLAUSIBLE TRACCIATI:
===========================

Evento: "Feedback Submitted"
Props:
  - feedbackType: "positive" | "negative"
  - messageId: string (ID univoco messaggio)
  - timestamp: ISO string

STORAGE LOCALE:
===============

Key: "vantyx_feedback"
Formato: {
  [messageId]: {
    type: "positive" | "negative",
    timestamp: "2025-10-07T..."
  }
}
"""


# ============================================================================
# MAIN: Salva documentazione
# ============================================================================

def generate_implementation_files():
    """
    Genera documentazione completa per implementazione feedback UI
    """

    print("=" * 80)
    print("FEEDBACK UI IMPLEMENTATION - COMPONENTI REACT")
    print("=" * 80)
    print()

    print("1. COMPONENTE FEEDBACK BUTTONS")
    print("-" * 80)
    print(FEEDBACK_BUTTONS_COMPONENT)
    print()

    print("2. HOOK PERSONALIZZATO useFeedback")
    print("-" * 80)
    print(USE_FEEDBACK_HOOK)
    print()

    print("3. COMPONENTE MESSAGGIO CON FEEDBACK")
    print("-" * 80)
    print(MESSAGE_WITH_FEEDBACK_COMPONENT)
    print()

    print("4. STILI CSS")
    print("-" * 80)
    print(FEEDBACK_CSS)
    print()

    print("5. CONFIGURAZIONE EVENTI PLAUSIBLE")
    print("-" * 80)
    import json
    print(json.dumps(PLAUSIBLE_EVENTS_CONFIG, indent=2))
    print()

    print("6. ESEMPIO DI INTEGRAZIONE")
    print("-" * 80)
    print(APP_INTEGRATION_EXAMPLE)
    print()

    print("7. ISTRUZIONI DI IMPLEMENTAZIONE")
    print("-" * 80)
    print(IMPLEMENTATION_INSTRUCTIONS)
    print()

    print("=" * 80)
    print("IMPLEMENTAZIONE COMPLETATA")
    print("=" * 80)


if __name__ == "__main__":
    generate_implementation_files()
