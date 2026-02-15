import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import { translations, getCurrentLocale } from '@/lib/i18n/translations';

const t = (key: keyof typeof translations.hooks) => {
  const locale = getCurrentLocale();
  return translations.hooks[key][locale];
};

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !isSupported) return;
      try {
        const { data, error } = await supabase
          .from('push_subscriptions' as any)
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        if (!error && data && (data as any[]).length > 0) {
          setIsSubscribed(true);
        }
      } catch (err) {
        logger.api.error('push_subscriptions', 'check', String(err));
      }
    };
    checkSubscription();
  }, [user, isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      toast.error(t('notificationsNotSupported'));
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error(t('notificationPermissionDenied'));
        return false;
      }

      await navigator.serviceWorker.ready;
      
      const subscriptionData = {
        user_id: user.id,
        endpoint: `browser-${Date.now()}`,
        p256dh: 'placeholder-key',
        auth: 'placeholder-auth',
      };

      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert(subscriptionData, { onConflict: 'user_id,endpoint' } as any);

      if (error) {
        logger.api.error('push_subscriptions', 'save', String(error));
        toast.error(t('notificationActivationError'));
        return false;
      }

      setIsSubscribed(true);
      toast.success(t('notificationsEnabled'));
      return true;
    } catch (err) {
      logger.api.error('push_subscriptions', 'subscribe', String(err));
      toast.error(t('notificationActivationFailed'));
      return false;
    }
  }, [isSupported, user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .delete()
        .eq('user_id', user.id);

      if (error) {
        logger.api.error('push_subscriptions', 'remove', String(error));
        return false;
      }

      setIsSubscribed(false);
      toast.success(t('notificationsDisabled'));
      return true;
    } catch (err) {
      logger.api.error('push_subscriptions', 'unsubscribe', String(err));
      return false;
    }
  }, [user]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;
    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    } catch (err) {
      console.log('Notification:', title, options);
    }
  }, [isSupported, permission]);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}
