-- SEC: Fix race condition in join_group_signal()
-- The original function reads max_participants and current count without locking,
-- allowing concurrent joiners to exceed the limit. This mirrors the fix applied
-- to join_session() in 20260213100000_audit_fix_critical_security.sql.

CREATE OR REPLACE FUNCTION public.join_group_signal(p_group_signal_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_max integer;
  v_current bigint;
  v_status text;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the group_signal row to prevent concurrent joins from exceeding capacity
  SELECT max_participants, status INTO v_max, v_status
  FROM group_signals
  WHERE id = p_group_signal_id
  FOR UPDATE;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Group signal not found';
  END IF;

  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Group signal is not active';
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM group_signal_members
    WHERE group_signal_id = p_group_signal_id AND user_id = v_uid
  ) THEN
    RAISE EXCEPTION 'Already a member of this group';
  END IF;

  -- Count current members (+1 for creator) under the row lock
  SELECT COUNT(*) + 1 INTO v_current
  FROM group_signal_members WHERE group_signal_id = p_group_signal_id;

  IF v_current >= v_max THEN
    RAISE EXCEPTION 'Group is full';
  END IF;

  INSERT INTO group_signal_members (group_signal_id, user_id)
  VALUES (p_group_signal_id, v_uid);

  -- Auto-set to full if at capacity
  IF v_current + 1 >= v_max THEN
    UPDATE group_signals SET status = 'full' WHERE id = p_group_signal_id;
  END IF;

  RETURN true;
END;
$$;
