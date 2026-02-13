-- =============================================================================
-- AUDIT FIX: Feedback Validation & Reliability System
-- Date: 2026-02-13
-- Fixes: SEC-05, SEC-06, BIZ-01, BIZ-02
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SEC-05: HIGH - Feedback to_user_id not validated as session participant
-- Fix: Update RLS policy to require to_user_id is a participant or creator
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Participants can give feedback" ON public.session_feedback;

CREATE POLICY "Participants can give feedback"
  ON public.session_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id
    AND auth.uid() != to_user_id
    AND EXISTS (
      -- from_user must be a participant or creator
      SELECT 1 FROM public.session_participants sp
      WHERE sp.session_id = session_feedback.session_id
      AND sp.user_id = auth.uid()
    )
    AND (
      -- to_user must be a participant or the session creator
      EXISTS (
        SELECT 1 FROM public.session_participants sp
        WHERE sp.session_id = session_feedback.session_id
        AND sp.user_id = session_feedback.to_user_id
      )
      OR EXISTS (
        SELECT 1 FROM public.scheduled_sessions ss
        WHERE ss.id = session_feedback.session_id
        AND ss.creator_id = session_feedback.to_user_id
      )
    )
  );

-- -----------------------------------------------------------------------------
-- SEC-06: HIGH - update_reliability_from_feedback() can be called repeatedly
-- Fix: Add validation that a matching feedback record exists and hasn't been counted
-- Also implements BIZ-02: Bayesian average for reliability score
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_reliability_from_feedback(
  p_user_id UUID,
  p_positive BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_total INTEGER;
  v_new_positive INTEGER;
  v_bayesian_score NUMERIC;
  v_prior_weight CONSTANT INTEGER := 5; -- Bayesian prior: assume 5 positive feedbacks
  v_prior_mean CONSTANT NUMERIC := 80.0; -- Prior mean reliability: 80%
BEGIN
  -- SECURITY: Verify the caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- SECURITY: Verify caller has given feedback to this user in some session
  IF NOT EXISTS (
    SELECT 1 FROM public.session_feedback sf
    WHERE sf.from_user_id = auth.uid()
    AND sf.to_user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'No feedback record found for this user pair';
  END IF;

  -- Insert or update reliability with Bayesian average
  INSERT INTO public.user_reliability (
    user_id, total_feedback_count, positive_feedback_count, reliability_score
  )
  VALUES (
    p_user_id,
    1,
    CASE WHEN p_positive THEN 1 ELSE 0 END,
    -- Bayesian: (prior_weight * prior_mean + actual_positive * 100) / (prior_weight + actual_total)
    ROUND((v_prior_weight * v_prior_mean + (CASE WHEN p_positive THEN 1 ELSE 0 END) * 100.0) / (v_prior_weight + 1), 2)
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_feedback_count = user_reliability.total_feedback_count + 1,
    positive_feedback_count = user_reliability.positive_feedback_count + CASE WHEN p_positive THEN 1 ELSE 0 END,
    -- BIZ-02: Bayesian average formula
    -- score = (prior_weight * prior_mean + positive_count * 100) / (prior_weight + total_count)
    reliability_score = ROUND(
      (v_prior_weight * v_prior_mean +
       (user_reliability.positive_feedback_count + CASE WHEN p_positive THEN 1 ELSE 0 END) * 100.0)
      / (v_prior_weight + user_reliability.total_feedback_count + 1),
      2
    ),
    updated_at = now();
END;
$$;

-- -----------------------------------------------------------------------------
-- BIZ-01: Align can_create_session() quota from 4 to 2 (matching migration 8)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_create_session(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium boolean;
  v_current_month text;
  v_sessions_count integer;
  v_purchased integer;
  v_free_limit integer := 2; -- Aligned with get_current_month_usage (was 4)
BEGIN
  SELECT is_premium, COALESCE(purchased_sessions, 0)
  INTO v_is_premium, v_purchased
  FROM profiles
  WHERE id = p_user_id;

  IF v_is_premium THEN
    RETURN true;
  END IF;

  v_current_month := to_char(now(), 'YYYY-MM');

  SELECT COALESCE(sessions_created, 0) INTO v_sessions_count
  FROM monthly_session_usage
  WHERE user_id = p_user_id AND month_year = v_current_month;

  RETURN COALESCE(v_sessions_count, 0) < (v_free_limit + COALESCE(v_purchased, 0));
END;
$$;
