import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
  });

  const handleOnline = useCallback(() => {
    setStatus(prev => {
      if (prev.wasOffline) {
        toast.success('Connexion rétablie !');
      }
      return { isOnline: true, wasOffline: false };
    });
  }, []);

  const handleOffline = useCallback(() => {
    setStatus({ isOnline: false, wasOffline: true });
    toast.error('Pas de connexion internet', {
      duration: 5000,
      icon: '📡',
    });
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
}
