import { useState, useCallback, useRef } from 'react';

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number | null;
  blockedUntil: number | null;
}

/**
 * Hook for client-side rate limiting on forms/actions
 * Prevents abuse by limiting attempts within a time window
 */
export function useRateLimit(options: RateLimitOptions) {
  const { maxAttempts, windowMs, blockDurationMs = 60000 } = options;
  
  const stateRef = useRef<RateLimitState>({
    attempts: 0,
    firstAttemptTime: null,
    blockedUntil: null,
  });
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const checkRateLimit = useCallback((): { allowed: boolean; message?: string } => {
    const now = Date.now();
    const state = stateRef.current;

    // Check if currently blocked
    if (state.blockedUntil && now < state.blockedUntil) {
      const remaining = Math.ceil((state.blockedUntil - now) / 1000);
      setRemainingTime(remaining);
      return { 
        allowed: false, 
        message: `Trop de tentatives. Réessaie dans ${remaining}s` 
      };
    }

    // Reset block if time has passed
    if (state.blockedUntil && now >= state.blockedUntil) {
      state.blockedUntil = null;
      state.attempts = 0;
      state.firstAttemptTime = null;
      setIsBlocked(false);
    }

    // Reset window if enough time has passed
    if (state.firstAttemptTime && now - state.firstAttemptTime > windowMs) {
      state.attempts = 0;
      state.firstAttemptTime = null;
    }

    // Check if limit exceeded
    if (state.attempts >= maxAttempts) {
      state.blockedUntil = now + blockDurationMs;
      setIsBlocked(true);
      const remaining = Math.ceil(blockDurationMs / 1000);
      setRemainingTime(remaining);
      return { 
        allowed: false, 
        message: `Trop de tentatives. Réessaie dans ${remaining}s` 
      };
    }

    return { allowed: true };
  }, [maxAttempts, windowMs, blockDurationMs]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    const state = stateRef.current;

    if (!state.firstAttemptTime) {
      state.firstAttemptTime = now;
    }
    state.attempts++;
  }, []);

  const reset = useCallback(() => {
    stateRef.current = {
      attempts: 0,
      firstAttemptTime: null,
      blockedUntil: null,
    };
    setIsBlocked(false);
    setRemainingTime(0);
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
    reset,
    isBlocked,
    remainingTime,
  };
}

// Preset configurations for common use cases
export const RATE_LIMIT_PRESETS = {
  login: { maxAttempts: 5, windowMs: 60000, blockDurationMs: 120000 },
  signup: { maxAttempts: 3, windowMs: 60000, blockDurationMs: 300000 },
  passwordReset: { maxAttempts: 3, windowMs: 300000, blockDurationMs: 600000 },
  report: { maxAttempts: 5, windowMs: 3600000, blockDurationMs: 3600000 },
  feedback: { maxAttempts: 10, windowMs: 3600000, blockDurationMs: 1800000 },
};
