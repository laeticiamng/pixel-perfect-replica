import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { translations, getCurrentLocale } from '@/lib/i18n/translations';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

const t = (key: keyof typeof translations.hooks) => {
  const locale = getCurrentLocale();
  return translations.hooks[key][locale];
};

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
  });

  const handleOnline = useCallback(() => {
    setStatus(prev => {
      if (prev.wasOffline) {
        toast.success(t('connectionRestored'));
      }
      return { isOnline: true, wasOffline: false };
    });
  }, []);

  const handleOffline = useCallback(() => {
    setStatus({ isOnline: false, wasOffline: true });
    toast.error(t('noInternetConnection'), {
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
