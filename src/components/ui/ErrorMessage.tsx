import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  variant = 'error'
}) => {
  const variantStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  const icons = {
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]}`} role="alert">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconStyles[variant]}`}>
          {icons[variant]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded px-2 py-1"
              aria-label="Riprova"
            >
              Riprova
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded px-2 py-1"
              aria-label="Chiudi"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
