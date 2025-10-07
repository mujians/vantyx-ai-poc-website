import { useState, useEffect } from 'react';

export interface UseOfflineReturn {
  isOffline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to detect offline/online status
 *
 * Returns:
 * - isOffline: current offline status
 * - wasOffline: indicates if the user was recently offline (useful for showing reconnection messages)
 */
export const useOffline = (): UseOfflineReturn => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setWasOffline(true);

      // Reset wasOffline flag after 5 seconds
      setTimeout(() => {
        setWasOffline(false);
      }, 5000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline, wasOffline };
};
