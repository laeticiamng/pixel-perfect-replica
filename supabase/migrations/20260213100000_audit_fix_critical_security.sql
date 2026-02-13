-- =============================================================================
-- AUDIT FIX: Critical & High Security Issues
-- Date: 2026-02-13
-- Fixes: SEC-01, SEC-02, SEC-03, SEC-04, SEC-09
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SEC-01: CRITICAL - add_purchased_sessions() has no auth/admin check
-- Anyone can give themselves free purchased sessions
-- Fix: Restrict to admin role only
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_purchased_sessions(p_user_id uuid, p_count integer DEFAULT 1)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_total integer;
BEGIN
  -- SECURITY: Only admins or system can add purchased sessions
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  IF p_count <= 0 OR p_count > 100 THEN
    RAISE EXCEPTION 'Invalid count: must be between 1 and 100';
  END IF;

  UPDATE profiles
  SET purchased_sessions = COALESCE(purchased_sessions, 0) + p_count, updated_at = now()
  WHERE id = p_user_id
  RETURNING purchased_sessions INTO v_new_total;

  IF v_new_total IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN v_new_total;
END;
$$;

-- -----------------------------------------------------------------------------
-- SEC-02: CRITICAL - Race condition in join_session()
-- Fix: Use SELECT ... FOR UPDATE to prevent concurrent overfilling
-- Also fixes SEC-04: Creator cannot join own session
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_participants INTEGER;
  v_current_count INTEGER;
  v_session_status TEXT;
  v_creator_id UUID;
BEGIN
  -- Lock the session row to prevent race conditions
  SELECT max_participants, status, creator_id
  INTO v_max_participants, v_session_status, v_creator_id
  FROM public.scheduled_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF v_session_status IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  IF v_session_status != 'open' THEN
    RAISE EXCEPTION 'Session is not open for joining';
  END IF;

  -- SEC-04: Creator cannot join their own session
  IF v_creator_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot join your own session';
  END IF;

  -- Count current participants (within the lock)
  SELECT COUNT(*) INTO v_current_count
  FROM public.session_participants
  WHERE session_id = p_session_id;

  IF v_current_count >= v_max_participants THEN
    RAISE EXCEPTION 'Session is full';
  END IF;

  -- Insert participant (UNIQUE constraint protects against double-join)
  INSERT INTO public.session_participants (session_id, user_id)
  VALUES (p_session_id, auth.uid());

  -- Update session status if now full
  IF v_current_count + 1 >= v_max_participants THEN
    UPDATE public.scheduled_sessions SET status = 'full' WHERE id = p_session_id;
  END IF;

  -- Update user reliability stats
  INSERT INTO public.user_reliability (user_id, sessions_joined)
  VALUES (auth.uid(), 1)
  ON CONFLICT (user_id)
  DO UPDATE SET sessions_joined = user_reliability.sessions_joined + 1;

  RETURN TRUE;
END;
$$;

-- -----------------------------------------------------------------------------
-- SEC-03: HIGH - NULL bug in leave_session() hours calculation
-- Fix: Handle NULL session data gracefully, ensure penalty always applies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.leave_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_date DATE;
  v_session_time TIME;
  v_hours_until_session NUMERIC;
  v_deleted_count INTEGER;
BEGIN
  -- Get session timing
  SELECT scheduled_date, start_time INTO v_session_date, v_session_time
  FROM public.scheduled_sessions
  WHERE id = p_session_id;

  IF v_session_date IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Delete participation
  DELETE FROM public.session_participants
  WHERE session_id = p_session_id AND user_id = auth.uid();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  IF v_deleted_count = 0 THEN
    RAISE EXCEPTION 'You are not a participant of this session';
  END IF;

  -- Update session status back to open if was full
  UPDATE public.scheduled_sessions
  SET status = 'open'
  WHERE id = p_session_id AND status = 'full';

  -- Calculate hours until session (with NULL safety)
  v_hours_until_session := EXTRACT(EPOCH FROM (
    (v_session_date + v_session_time) - NOW()
  )) / 3600.0;

  -- Record late cancellation if less than 2 hours before session
  IF v_hours_until_session IS NOT NULL AND v_hours_until_session < 2 THEN
    INSERT INTO public.user_reliability (user_id, late_cancellations, reliability_score)
    VALUES (auth.uid(), 1, 95)
    ON CONFLICT (user_id)
    DO UPDATE SET
      late_cancellations = user_reliability.late_cancellations + 1,
      reliability_score = GREATEST(0, user_reliability.reliability_score - 5),
      updated_at = now();
  END IF;

  RETURN TRUE;
END;
$$;

-- -----------------------------------------------------------------------------
-- SEC-09: HIGH - No length limit on session_messages.content
-- Fix: Add CHECK constraint
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'session_messages_content_length'
  ) THEN
    ALTER TABLE public.session_messages
    ADD CONSTRAINT session_messages_content_length
    CHECK (length(content) <= 1000);
  END IF;
END $$;

-- Also add length limit on session notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'scheduled_sessions_note_length'
  ) THEN
    ALTER TABLE public.scheduled_sessions
    ADD CONSTRAINT scheduled_sessions_note_length
    CHECK (note IS NULL OR length(note) <= 500);
  END IF;
END $$;

-- Add length limit on feedback comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'session_feedback_comment_length'
  ) THEN
    ALTER TABLE public.session_feedback
    ADD CONSTRAINT session_feedback_comment_length
    CHECK (comment IS NULL OR length(comment) <= 500);
  END IF;
END $$;
