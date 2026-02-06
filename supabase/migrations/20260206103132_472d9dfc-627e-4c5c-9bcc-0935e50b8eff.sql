
-- SEC-01: RPC for QR check-in without exposing qr_code_secret to client
CREATE OR REPLACE FUNCTION public.check_in_event_by_qr(p_event_id uuid, p_qr_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_secret text;
  v_is_participant boolean;
BEGIN
  -- Verify QR secret
  SELECT qr_code_secret INTO v_secret
  FROM events
  WHERE id = p_event_id AND is_active = true;

  IF v_secret IS NULL OR v_secret != p_qr_secret THEN
    RETURN false;
  END IF;

  -- Verify user is a participant
  SELECT EXISTS(
    SELECT 1 FROM event_participants
    WHERE event_id = p_event_id AND user_id = auth.uid()
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RETURN false;
  END IF;

  -- Update check-in status
  UPDATE event_participants
  SET checked_in = true, checked_in_at = now()
  WHERE event_id = p_event_id AND user_id = auth.uid();

  RETURN true;
END;
$$;

-- SEC-02: RPC to increment sessions_created in user_reliability
CREATE OR REPLACE FUNCTION public.increment_reliability_sessions_created(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_reliability (user_id, sessions_created)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET sessions_created = user_reliability.sessions_created + 1, updated_at = now();
END;
$$;
