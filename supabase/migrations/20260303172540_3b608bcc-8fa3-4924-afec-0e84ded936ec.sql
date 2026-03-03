-- Fix: verification_badges SELECT policy leaks active status of ghost_mode users
-- The current policy checks active_signals but doesn't respect ghost_mode

DROP POLICY IF EXISTS "Authenticated users can view badges of active users" ON public.verification_badges;

CREATE POLICY "Authenticated users can view badges of active users"
ON public.verification_badges
FOR SELECT
USING (
  (auth.uid() IS NOT NULL)
  AND (
    EXISTS (
      SELECT 1 FROM active_signals s
      LEFT JOIN user_settings us ON us.user_id = s.user_id
      WHERE s.user_id = verification_badges.user_id
        AND s.expires_at > now()
        AND (us.ghost_mode IS NULL OR us.ghost_mode = false)
    )
  )
);

-- Cleanup: Remove duplicate INSERT policies on user_reliability
DROP POLICY IF EXISTS "Users can insert their own reliability" ON public.user_reliability;
DROP POLICY IF EXISTS "Users can view their own reliability" ON public.user_reliability;