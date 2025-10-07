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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg mb-4">👋 Benvenuto su Vantyx.ai</p>
            <p className="text-sm">Inizia una conversazione</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <p className="text-gray-600">Typing...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
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
          >
            Invia
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
      title: 'Vantyx Chat',
      component: 'chat',
      position: { x: 100, y: 100 },
      size: { width: 600, height: 500 },
    });
  };

  return (
    <>
      <OfflineBanner isOffline={isOffline} wasOffline={wasOffline} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 relative overflow-hidden">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <pre className="text-green-400 font-mono text-xs sm:text-sm md:text-base mb-8 inline-block">
{`
██╗   ██╗ █████╗ ███╗   ██╗████████╗██╗   ██╗██╗  ██╗
██║   ██║██╔══██╗████╗  ██║╚══██╔══╝╚██╗ ██╔╝╚██╗██╔╝
██║   ██║███████║██╔██╗ ██║   ██║    ╚████╔╝  ╚███╔╝
╚██╗ ██╔╝██╔══██║██║╚██╗██║   ██║     ╚██╔╝   ██╔██╗
 ╚████╔╝ ██║  ██║██║ ╚████║   ██║      ██║   ██╔╝ ██╗
  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝
`}
          </pre>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
            AI-Native Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Il futuro della gestione intelligente
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              onClick={handleOpenChat}
              size="large"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              🚀 Apri Chat
            </Button>
            <Button
              onClick={() =>
                openWindow({
                  title: 'About Vantyx',
                  component: 'about',
                  position: { x: 150, y: 150 },
                  size: { width: 500, height: 400 },
                })
              }
              variant="secondary"
              size="large"
              className="px-8 py-3 text-lg"
            >
              📖 Scopri di più
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-400 text-sm">Intelligenza artificiale integrata per decisioni smart</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Real-time</h3>
              <p className="text-gray-400 text-sm">Aggiornamenti in tempo reale e streaming</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Personalizzato</h3>
              <p className="text-gray-400 text-sm">Interfaccia adattiva alle tue esigenze</p>
            </div>
          </div>
        </div>

        {/* Windows */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            {windows.map((window) => (
              <Window key={window.id} window={window}>
                {window.component === 'chat' && <ChatWindow />}
                {window.component === 'about' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">About Vantyx</h2>
                    <p className="text-gray-700 mb-4">
                      Vantyx è una piattaforma AI-native progettata per rivoluzionare
                      la gestione aziendale attraverso l'intelligenza artificiale.
                    </p>
                    <p className="text-gray-700">
                      Con Vantyx, ottieni insights in tempo reale, automazione
                      intelligente e un'interfaccia conversazionale che si adatta
                      alle tue esigenze.
                    </p>
                  </div>
                )}
              </Window>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
