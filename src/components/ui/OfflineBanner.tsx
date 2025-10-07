import React from 'react';

interface OfflineBannerProps {
  isOffline: boolean;
  wasOffline: boolean;
}

/**
 * Banner component to display offline/reconnection status
 */
export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline, wasOffline }) => {
  if (!isOffline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 py-3 px-4 text-center text-white font-medium transition-all duration-300 ${
        isOffline
          ? 'bg-red-600'
          : 'bg-green-600'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {isOffline ? (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
          </svg>
          <span>Nessuna connessione Internet. Alcune funzionalità potrebbero non essere disponibili.</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Connessione ripristinata!</span>
        </div>
      )}
    </div>
  );
};
