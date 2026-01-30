import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface RevealRateLimitResult {
  allowed: boolean;
  message?: string;
}

/**
 * Hook pour gérer le rate limiting des révélations de profil (anti-stalking)
 * Max 10 révélations par heure
 */
export function useRevealRateLimit() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const MAX_REVEALS_PER_HOUR = 10;

  /**
   * Vérifie si l'utilisateur peut révéler un profil et l'enregistre
   */
  const checkAndLogReveal = useCallback(async (
    revealedUserId: string
  ): Promise<RevealRateLimitResult> => {
    if (!user) {
      return { allowed: false, message: 'Non authentifié' };
    }

    setIsChecking(true);

    try {
      // Appeler la fonction RPC qui vérifie et log en une seule transaction
      const { data, error } = await supabase.rpc('log_reveal', {
        p_revealed_user_id: revealedUserId
      });

      if (error) {
        console.error('[RevealRateLimit] Error:', error);
        // En cas d'erreur, on autorise par défaut (fail-open pour UX)
        return { allowed: true };
      }

      if (data === false) {
        toast.error('Tu as atteint la limite de profils consultés. Réessaie dans 1h.');
        return { 
          allowed: false, 
          message: 'Limite de révélations atteinte (10/heure)' 
        };
      }

      // Mettre à jour le compteur local
      setRevealCount(prev => prev + 1);
      return { allowed: true };

    } catch (err) {
      console.error('[RevealRateLimit] Exception:', err);
      return { allowed: true }; // Fail-open
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  /**
   * Vérifie simplement si l'utilisateur peut encore révéler (sans log)
   */
  const canReveal = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_reveal_rate_limit', {
        p_user_id: user.id
      });

      if (error) {
        console.error('[RevealRateLimit] Check error:', error);
        return true; // Fail-open
      }

      return data === true;
    } catch {
      return true; // Fail-open
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
