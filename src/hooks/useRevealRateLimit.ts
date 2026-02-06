import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { translations, getCurrentLocale } from '@/lib/i18n/translations';

interface RevealRateLimitResult {
  allowed: boolean;
  message?: string;
}

const t = (key: keyof typeof translations.hooks) => {
  const locale = getCurrentLocale();
  return translations.hooks[key][locale];
};

/**
 * Hook pour gérer le rate limiting des révélations de profil (anti-stalking)
 * Max 10 révélations par heure
 */
export function useRevealRateLimit() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const MAX_REVEALS_PER_HOUR = 10;

  const checkAndLogReveal = useCallback(async (
    revealedUserId: string
  ): Promise<RevealRateLimitResult> => {
    if (!user) {
      return { allowed: false, message: 'Not authenticated' };
    }

    setIsChecking(true);

    try {
      const { data, error } = await supabase.rpc('log_reveal', {
        p_revealed_user_id: revealedUserId
      });

      if (error) {
        console.error('[RevealRateLimit] Error:', error);
        return { allowed: true };
      }

      if (data === false) {
        toast.error(t('revealLimitReached'));
        return { 
          allowed: false, 
          message: t('revealLimitMessage')
        };
      }

      setRevealCount(prev => prev + 1);
      return { allowed: true };

    } catch (err) {
      console.error('[RevealRateLimit] Exception:', err);
      return { allowed: true };
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  const canReveal = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_reveal_rate_limit', {
        p_user_id: user.id
      });

      if (error) {
        console.error('[RevealRateLimit] Check error:', error);
        return true;
      }

      return data === true;
    } catch {
      return true;
    }
  }, [user]);

  return {
    checkAndLogReveal,
    canReveal,
    isChecking,
    revealCount,
    maxReveals: MAX_REVEALS_PER_HOUR,
    remainingReveals: Math.max(0, MAX_REVEALS_PER_HOUR - revealCount),
  };
}
