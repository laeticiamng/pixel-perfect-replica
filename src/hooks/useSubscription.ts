import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  plan: 'nearvityplus' | 'monthly' | 'yearly' | null;
}

export type PricingPlan = 'free' | 'session' | 'nearvityplus';

// Cache & backoff constants
const MIN_POLL_INTERVAL = 5 * 60_000; // 5 minutes
const MAX_BACKOFF = 10 * 60_000; // 10 minutes max
const CACHE_TTL = 60_000; // Don't re-fetch if last fetch < 60s ago

export function useSubscription() {
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for stable references & cache control
  const refreshProfileRef = useRef(refreshProfile);
  const lastFetchedAt = useRef<number>(0);
  const consecutiveErrors = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    refreshProfileRef.current = refreshProfile;
  }, [refreshProfile]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const checkSubscription = useCallback(async (force = false) => {
    if (!user) {
      setStatus(null);
      return;
    }

    // Skip if recently fetched (unless forced)
    const now = Date.now();
    if (!force && now - lastFetchedAt.current < CACHE_TTL) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription');
      
      if (fnError) throw fnError;
      
      if (!isMountedRef.current) return;

      setStatus({
        subscribed: data.subscribed,
        productId: data.product_id,
        subscriptionEnd: data.subscription_end,
        plan: data.plan,
      });

      lastFetchedAt.current = Date.now();
      consecutiveErrors.current = 0;

      // Refresh profile to get updated is_premium status
      await refreshProfileRef.current();
    } catch (err) {
      if (!isMountedRef.current) return;
      logger.api.error('subscriptions', 'fetch', String(err));
      setError(err instanceof Error ? err.message : 'Verification error');
      consecutiveErrors.current += 1;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  // Nearvity+ subscription checkout (9.90€/mois)
  const createNearvityPlusCheckout = async () => {
    if (!user) throw new Error('Not authenticated');

    // Refresh session to ensure valid token
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      logger.api.error('auth', 'session-refresh', String(refreshError));
      throw new Error('Session expired, please log in again');
    }

    const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
      body: { plan: 'nearvityplus' },
    });

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data.url;
  };

  // Session purchase (0.99€/session)
  const purchaseSession = async (quantity: number = 1) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: fnError } = await supabase.functions.invoke('purchase-session', {
      body: { quantity },
    });

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data.url;
  };

  // Confirm session purchase after Stripe redirect
  const confirmSessionPurchase = async (sessionsPurchased: number, checkoutSessionId: string) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: fnError } = await supabase.functions.invoke('confirm-session-purchase', {
      body: { sessions_purchased: sessionsPurchased, checkout_session_id: checkoutSessionId },
    });

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data;
  };

  // Legacy checkout for existing yearly plan
  const createCheckout = async (plan: 'monthly' | 'yearly') => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
      body: { plan },
    });

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data.url;
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: fnError } = await supabase.functions.invoke('customer-portal');

    if (fnError) throw fnError;
    if (data.error) throw new Error(data.error);

    return data.url;
  };

  // Initial fetch on mount
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Polling with exponential backoff on errors
  useEffect(() => {
    if (!user) return;

    const getInterval = () => {
      if (consecutiveErrors.current > 0) {
        // Backoff: double interval per consecutive error, cap at MAX_BACKOFF
        return Math.min(MIN_POLL_INTERVAL * Math.pow(2, consecutiveErrors.current), MAX_BACKOFF);
      }
      return MIN_POLL_INTERVAL;
    };

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        checkSubscription();
        scheduleNext();
      }, getInterval());
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [user, checkSubscription]);

  return {
    status,
    isLoading,
    error,
    checkSubscription: () => checkSubscription(true), // Public API always forces
    createCheckout,
    createNearvityPlusCheckout,
    purchaseSession,
    confirmSessionPurchase,
    openCustomerPortal,
    isSubscribed: status?.subscribed ?? false,
  };
}
