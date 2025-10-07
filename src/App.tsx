import React, { useState, useRef, useEffect } from 'react';
import { initSentry } from './sentry';
import { useOffline } from './hooks/useOffline';
import { useChat } from './hooks/useChat';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { VoiceInput } from './components/ui/VoiceInput';
import { MicroPrompts } from './components/ui/MicroPrompts';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Window } from './components/ui_components/Window';
import { useWindowStore } from './stores/windowStore';

// Initialize Sentry
initSentry();

// Chat Window Component
function ChatWindow() {
  const { messages, isLoading, sendMessage, error } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(transcript);
  };

  const handleMicroPromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  const defaultPrompts = [
    { id: '1', text: 'Cos\'è Vantyx?', category: 'prospect' as const },
    { id: '2', text: 'Come funziona?', category: 'prospect' as const },
    { id: '3', text: 'Prezzi e piani', category: 'prospect' as const },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Benvenuto su Vantyx AI</h3>
            <p className="text-sm text-gray-500">Inizia una conversazione per scoprire di più</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-600">Digitando...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
        <MicroPrompts prompts={defaultPrompts} onPromptClick={handleMicroPromptClick} />

        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={isLoading}
            className="flex-1"
          />
          <VoiceInput onTranscript={handleVoiceTranscript} />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isOffline, wasOffline } = useOffline();
  const { windows, openWindow, startCleanupTimer, stopCleanupTimer } = useWindowStore();

  useEffect(() => {
    startCleanupTimer();
    return () => stopCleanupTimer();
  }, [startCleanupTimer, stopCleanupTimer]);

  const handleOpenChat = () => {
    openWindow({
      title: 'Vantyx AI Assistant',
      component: 'chat',
      position: { x: window.innerWidth / 2 - 350, y: 80 },
      size: { width: 700, height: 600 },
    });
  };

  return (
    <>
      <OfflineBanner isOffline={isOffline} wasOffline={wasOffline} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          {/* Logo/Brand */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
            Vantyx.ai
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
            La Piattaforma AI-Native per il Futuro
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Intelligenza artificiale avanzata per gestione aziendale, automazione e insights in tempo reale
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-20">
            <Button
              onClick={handleOpenChat}
              size="large"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Inizia Chat
              </span>
            </Button>
            <Button
              onClick={() =>
                openWindow({
                  title: 'Scopri Vantyx',
                  component: 'about',
                  position: { x: window.innerWidth / 2 - 300, y: 120 },
                  size: { width: 600, height: 500 },
                })
              }
              variant="secondary"
              size="large"
              className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 text-lg font-semibold backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scopri di più
              </span>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
            <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:border-white/20 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">AI-Powered</h3>
              <p className="text-gray-300 leading-relaxed">Intelligenza artificiale avanzata per analisi predittive e decisioni automatizzate in tempo reale</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:border-white/20 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Real-time</h3>
              <p className="text-gray-300 leading-relaxed">Elaborazione streaming e aggiornamenti istantanei per restare sempre aggiornato</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:border-white/20 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Personalizzato</h3>
              <p className="text-gray-300 leading-relaxed">Interfaccia adattiva che apprende dalle tue preferenze e si ottimizza nel tempo</p>
            </div>
          </div>
        </div>

        {/* Windows */}
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="relative w-full h-full pointer-events-auto">
            {windows.map((window) => (
              <Window key={window.id} window={window}>
                {window.component === 'chat' && <ChatWindow />}
                {window.component === 'about' && (
                  <div className="p-8 bg-white h-full overflow-auto">
                    <div className="max-w-2xl mx-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>

                      <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Vantyx.ai
                      </h2>

                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                          <strong className="text-gray-900">Vantyx</strong> è una piattaforma AI-native di nuova generazione progettata per
                          rivoluzionare la gestione aziendale attraverso l'intelligenza artificiale avanzata.
                        </p>

                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Cosa Offriamo</h3>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span><strong>Insights in Tempo Reale:</strong> Analisi predittive e monitoraggio continuo</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span><strong>Automazione Intelligente:</strong> Processi ottimizzati con AI</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span><strong>Interfaccia Conversazionale:</strong> Interazione naturale e intuitiva</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span><strong>Personalizzazione Adattiva:</strong> Si evolve con le tue esigenze</span>
                            </li>
                          </ul>
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                          Con Vantyx, trasformi dati complessi in decisioni strategiche, automatizzi workflow critici
                          e ottieni un vantaggio competitivo attraverso l'intelligenza artificiale.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Window>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}

export default App;
