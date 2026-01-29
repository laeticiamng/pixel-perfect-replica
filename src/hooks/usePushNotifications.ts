import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

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

  // Check support and current permission
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check if user is already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !isSupported) return;

      try {
        // Use raw query to avoid type issues with new table
        const { data, error } = await supabase
          .from('push_subscriptions' as any)
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!error && data && (data as any[]).length > 0) {
          setIsSubscribed(true);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };

    checkSubscription();
  }, [user, isSupported]);

  // Request permission and subscribe
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      toast.error('Les notifications ne sont pas supportées');
      return false;
    }

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Permission de notification refusée');
        return false;
      }

      // Get service worker registration
      await navigator.serviceWorker.ready;
      
      // Store a basic subscription record
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
        console.error('Error saving subscription:', error);
        toast.error('Erreur lors de l\'activation des notifications');
        return false;
      }

      setIsSubscribed(true);
      toast.success('Notifications activées ! 🔔');
      return true;
    } catch (err) {
      console.error('Error subscribing to push:', err);
      toast.error('Erreur lors de l\'activation');
      return false;
    }
  }, [isSupported, user]);

  // Unsubscribe
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing subscription:', error);
        return false;
      }

      setIsSubscribed(false);
      toast.success('Notifications désactivées');
      return true;
    } catch (err) {
      console.error('Error unsubscribing:', err);
      return false;
    }
  }, [user]);

  // Show a notification immediately (when app is in foreground)
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    } catch (err) {
      // Fallback for browsers that don't support Notification constructor
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
