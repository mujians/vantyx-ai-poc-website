import React, { useState, useRef, useEffect } from 'react';
import { initSentry } from './sentry';
import { useOffline } from './hooks/useOffline';
import { useChat } from './hooks/useChat';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { Layout, LayoutHeader, LayoutMain } from './components/ui/Layout';
import { Logo } from './components/ui/Logo';
import { VoiceInput } from './components/ui/VoiceInput';
import { MicroPrompts } from './components/ui/MicroPrompts';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Card, CardBody } from './components/ui/Card';

// Initialize Sentry
initSentry();

function App() {
  const { isOffline, wasOffline } = useOffline();
  const { messages, isLoading, sendMessage } = useChat();
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

  return (
    <>
      <OfflineBanner isOffline={isOffline} wasOffline={wasOffline} />
      <Layout className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
        <LayoutHeader>
          <div className="text-center py-6">
            <Logo />
            <p className="text-sm text-gray-400 mt-2">
              AI-Native Conversational Interface
            </p>
          </div>
        </LayoutHeader>

        <LayoutMain>
          <Card className="bg-gray-800 border-gray-700 h-[calc(100vh-300px)] flex flex-col">
            <CardBody className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <p className="text-lg mb-4">👋 Benvenuto su Vantyx.ai</p>
                  <p className="text-sm">Inizia una conversazione o usa un microprompt qui sotto</p>
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
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-lg px-4 py-2">
                    <p className="text-gray-400">Typing...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardBody>

            <div className="border-t border-gray-700 p-4 space-y-3">
              <MicroPrompts onPromptClick={handleMicroPromptClick} />

              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scrivi un messaggio..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
          </Card>
        </LayoutMain>
      </Layout>
    </>
  );
}

export default App;
