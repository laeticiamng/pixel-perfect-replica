-- =============================================================================
-- AUDIT FIX: Session Lifecycle Automation
-- Date: 2026-02-13
-- Fixes: BIZ-03 (no-show detection), BIZ-04 (auto-complete sessions)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- BIZ-04: Sessions are never automatically marked as "completed"
-- Fix: Function to auto-complete expired sessions
-- Should be called via cron job (pg_cron) every 15 minutes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  completed_count INTEGER;
BEGIN
  -- Mark sessions as completed when their end time has passed
  UPDATE public.scheduled_sessions
  SET status = 'completed', updated_at = now()
  WHERE status IN ('open', 'full')
    AND (
      scheduled_date + start_time + (duration_minutes || ' minutes')::interval
    ) < NOW();

  GET DIAGNOSTICS completed_count = ROW_COUNT;

  -- Log the operation
  IF completed_count > 0 THEN
    INSERT INTO cron_job_executions (job_name, status, triggered_by, result, completed_at, duration_ms)
    VALUES (
      'complete_expired_sessions',
      'success',
      'system',
      jsonb_build_object('completed_sessions', completed_count),
      NOW(),
      0
    );
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- BIZ-03: No-shows are not detected
-- Fix: Function to detect and penalize participants who didn't check in
-- Should be called via cron job after complete_expired_sessions()
-- Runs 30 minutes after session end time to give late check-ins a chance
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.detect_no_shows()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  no_show_count INTEGER := 0;
  r RECORD;
BEGIN
  -- Find participants who didn't check in for completed sessions
  -- Only for sessions completed in the last 24 hours (avoid reprocessing)
  FOR r IN
    SELECT sp.id, sp.user_id, sp.session_id
    FROM public.session_participants sp
    JOIN public.scheduled_sessions ss ON ss.id = sp.session_id
    WHERE ss.status = 'completed'
      AND sp.checked_in = false
      -- Session ended at least 30 min ago
      AND (ss.scheduled_date + ss.start_time + (ss.duration_minutes || ' minutes')::interval + INTERVAL '30 minutes') < NOW()
      -- But not older than 24 hours (avoid reprocessing)
      AND (ss.scheduled_date + ss.start_time + (ss.duration_minutes || ' minutes')::interval) > (NOW() - INTERVAL '24 hours')
  LOOP
    -- Penalize no-show: decrement reliability score by 10 points
    INSERT INTO public.user_reliability (user_id, no_shows, reliability_score)
    VALUES (r.user_id, 1, 90)
    ON CONFLICT (user_id)
    DO UPDATE SET
      no_shows = user_reliability.no_shows + 1,
      reliability_score = GREATEST(0, user_reliability.reliability_score - 10),
      updated_at = now();

    no_show_count := no_show_count + 1;
  END LOOP;

  -- Log the operation
  IF no_show_count > 0 THEN
    INSERT INTO cron_job_executions (job_name, status, triggered_by, result, completed_at, duration_ms)
    VALUES (
      'detect_no_shows',
      'success',
      'system',
      jsonb_build_object('no_shows_detected', no_show_count),
      NOW(),
      0
    );
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- Schedule cron jobs (if pg_cron is available)
-- Complete sessions every 15 minutes, detect no-shows every hour
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  -- Try to schedule the jobs; fail silently if pg_cron is not available
  BEGIN
    PERFORM cron.schedule('complete-expired-sessions', '*/15 * * * *', 'SELECT public.complete_expired_sessions()');
    PERFORM cron.schedule('detect-no-shows', '0 * * * *', 'SELECT public.detect_no_shows()');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available - skipping cron job scheduling. Run complete_expired_sessions() and detect_no_shows() manually or via edge function.';
  END;
END $$;

-- -----------------------------------------------------------------------------
-- Add missing indexes for performance (from audit PERF recommendations)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_creator ON public.scheduled_sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_from_user ON public.session_feedback(from_user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_session_usage_lookup ON public.monthly_session_usage(user_id, month_year);
