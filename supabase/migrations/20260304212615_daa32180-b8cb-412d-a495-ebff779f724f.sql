
-- RPC to find or create an interaction between two connected users
CREATE OR REPLACE FUNCTION public.get_or_create_interaction(p_other_user_id uuid, p_activity activity_type DEFAULT 'talking')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_interaction_id uuid;
  v_user_id uuid := auth.uid();
BEGIN
  -- Check existing interaction
  SELECT id INTO v_interaction_id
  FROM interactions
  WHERE (user_id = v_user_id AND target_user_id = p_other_user_id)
     OR (user_id = p_other_user_id AND target_user_id = v_user_id)
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_interaction_id IS NOT NULL THEN
    RETURN v_interaction_id;
  END IF;

  -- Verify they are connected (accepted)
  IF NOT EXISTS (
    SELECT 1 FROM connections
    WHERE status = 'accepted'
      AND ((user_a = LEAST(v_user_id, p_other_user_id) AND user_b = GREATEST(v_user_id, p_other_user_id)))
  ) THEN
    RAISE EXCEPTION 'Not connected with this user';
  END IF;

  -- Create new interaction
  INSERT INTO interactions (user_id, target_user_id, activity, icebreaker)
  VALUES (v_user_id, p_other_user_id, p_activity, NULL)
  RETURNING id INTO v_interaction_id;

  RETURN v_interaction_id;
END;
$$;
