import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Push notification subscription using the Web Push API.
// Uses type assertions for pushManager since TS lib may not include it.

export function usePushSubscription() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isPushSupported = () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  };

  const checkSubscription = useCallback(async () => {
    if (!user || !isPushSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const pm = (registration as any).pushManager;
      if (!pm) return false;
      const subscription = await pm.getSubscription();

      if (subscription) {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)
          .single();

        setIsSubscribed(!!data);
        return !!data;
      }

      setIsSubscribed(false);
      return false;
    } catch (error) {
      console.error('[usePushSubscription] Check error:', error);
      return false;
    }
  }, [user]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !isPushSupported()) return false;

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setIsLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const pm = (registration as any).pushManager;
      if (!pm) { setIsLoading(false); return false; }

      const subscription = await pm.subscribe({ userVisibleOnly: true });
      const subscriptionData = subscription.toJSON();

      if (!subscriptionData.endpoint || !subscriptionData.keys) {
        throw new Error('Invalid subscription data');
      }

      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
        }, { onConflict: 'user_id,endpoint' });

      if (error) throw error;

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[usePushSubscription] Subscribe error:', error);
      setIsLoading(false);
      return false;
    }
  }, [user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !isPushSupported()) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const pm = (registration as any).pushManager;
      if (!pm) { setIsLoading(false); return false; }

      const subscription = await pm.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[usePushSubscription] Unsubscribe error:', error);
      setIsLoading(false);
      return false;
    }
  }, [user]);

  return {
    isPushSupported: isPushSupported(),
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
}
