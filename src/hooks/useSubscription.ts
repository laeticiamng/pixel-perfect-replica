import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  plan: 'easyplus' | 'monthly' | 'yearly' | null;
}

export type PricingPlan = 'free' | 'session' | 'easyplus';

export function useSubscription() {
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription');
      
      if (fnError) throw fnError;
      
      setStatus({
        subscribed: data.subscribed,
        productId: data.product_id,
        subscriptionEnd: data.subscription_end,
        plan: data.plan,
      });

      // Refresh profile to get updated is_premium status
      await refreshProfile();
    } catch (err) {
      console.error('[useSubscription] Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de vérification');
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshProfile]);

  // Easy+ subscription checkout (9.90€/mois)
  const createEasyPlusCheckout = async () => {
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
      body: { plan: 'easyplus' },
    });

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data.url;
  };

  // Session purchase (0.99€/session)
  const purchaseSession = async (quantity: number = 1) => {
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error: fnError } = await supabase.functions.invoke('purchase-session', {
      body: { quantity },
    });

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data.url;
  };

  // Confirm session purchase after Stripe redirect
  const confirmSessionPurchase = async (sessionsPurchased: number) => {
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error: fnError } = await supabase.functions.invoke('confirm-session-purchase', {
      body: { sessions_purchased: sessionsPurchased },
    });

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data;
  };

  // Legacy checkout for existing yearly plan
  const createCheckout = async (plan: 'monthly' | 'yearly') => {
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
      body: { plan },
    });

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data.url;
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error: fnError } = await supabase.functions.invoke('customer-portal');

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data.url;
  };

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return {
    status,
    isLoading,
    error,
    checkSubscription,
    createCheckout,
    createEasyPlusCheckout,
    purchaseSession,
    confirmSessionPurchase,
    openCustomerPortal,
    isSubscribed: status?.subscribed ?? false,
  };
}
