import React, { useState, useEffect, useRef } from 'react';

type VoiceInputState = 'idle' | 'recording' | 'processing';

interface VoiceInputProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  onTranscript?: (transcript: string) => void;
  showTextFallback?: boolean;
}

// Declare Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onClick,
  disabled = false,
  className = '',
  onTranscript,
  showTextFallback = true,
}) => {
  const [state, setState] = useState<VoiceInputState>('idle');
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    requestMicrophonePermission();
    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setPermissionError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'it-IT'; // Italian language

    recognition.onstart = () => {
      setState('recording');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (event.results[event.results.length - 1].isFinal) {
        setState('processing');
        if (onTranscript) {
          onTranscript(transcript);
        }
        setTimeout(() => setState('idle'), 500);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setState('idle');

      if (event.error === 'not-allowed') {
        setPermissionError('Microphone permission denied.');
      } else if (event.error === 'no-speech') {
        setPermissionError('No speech detected. Please try again.');
      } else {
        setPermissionError('Speech recognition error: ' + event.error);
      }
    };

    recognition.onend = () => {
      if (state === 'recording') {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      setPermissionError(null);
      // Stop the stream immediately after permission is granted
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setHasPermission(false);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionError('Microphone permission denied. Please enable microphone access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setPermissionError('No microphone found. Please connect a microphone and try again.');
        } else {
          setPermissionError('Error accessing microphone: ' + error.message);
        }
      } else {
        setPermissionError('Unknown error accessing microphone.');
      }
      console.error('Microphone permission error:', error);
    }
  };

  const handleVoiceInput = () => {
    if (!hasPermission || !recognitionRef.current) return;

    if (state === 'recording') {
      recognitionRef.current.stop();
    } else {
      setPermissionError(null);
      recognitionRef.current.start();
    }

    if (onClick) {
      onClick();
    }
  };

  const getButtonStyles = () => {
    switch (state) {
      case 'recording':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse';
      case 'processing':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'idle':
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getAriaLabel = () => {
    switch (state) {
      case 'recording':
        return 'Recording in progress';
      case 'processing':
        return 'Processing audio';
      case 'idle':
      default:
        return 'Voice input';
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && onTranscript) {
      onTranscript(textInput.trim());
      setTextInput('');
    }
  };

  const shouldShowTextFallback = showTextFallback && (!hasPermission || permissionError);

  return (
    <div className="relative">
      {shouldShowTextFallback ? (
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Scrivi il tuo messaggio..."
            disabled={disabled}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label="Text input fallback"
          />
          <button
            type="submit"
            disabled={disabled || !textInput.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            Invia
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={disabled || !hasPermission}
            className={`flex items-center justify-center w-12 h-12 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed ${getButtonStyles()} ${className}`.trim()}
            aria-label={getAriaLabel()}
            title={permissionError || undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
              <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
            </svg>
          </button>
          {permissionError && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm whitespace-nowrap z-10">
              {permissionError}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { VoiceInput };
export default VoiceInput;
