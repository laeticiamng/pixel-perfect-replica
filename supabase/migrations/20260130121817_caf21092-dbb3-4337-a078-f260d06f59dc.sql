-- Add purchased_sessions column to track pay-per-use sessions
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS purchased_sessions integer DEFAULT 0;

-- Drop the existing function first to change return type
DROP FUNCTION IF EXISTS public.get_current_month_usage(uuid);

-- Recreate with updated return type including purchased sessions
CREATE FUNCTION public.get_current_month_usage(p_user_id uuid)
RETURNS TABLE(
  sessions_created integer,
  sessions_limit integer,
  is_premium boolean,
  can_create boolean,
  purchased_sessions integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium boolean;
  v_sessions_created integer;
  v_purchased_sessions integer;
  v_current_month text;
BEGIN
  v_current_month := to_char(CURRENT_DATE, 'YYYY-MM');
  
  SELECT p.is_premium, COALESCE(p.purchased_sessions, 0)
  INTO v_is_premium, v_purchased_sessions
  FROM profiles p
  WHERE p.id = p_user_id;
  
  SELECT COALESCE(msu.sessions_created, 0)
  INTO v_sessions_created
  FROM monthly_session_usage msu
  WHERE msu.user_id = p_user_id 
    AND msu.month_year = v_current_month;
  
  IF v_sessions_created IS NULL THEN
    v_sessions_created := 0;
  END IF;
  
  IF v_is_premium THEN
    RETURN QUERY SELECT 
      v_sessions_created,
      -1,
      v_is_premium,
      true,
      v_purchased_sessions;
  ELSE
    RETURN QUERY SELECT 
      v_sessions_created,
      2 + v_purchased_sessions,
      v_is_premium,
      v_sessions_created < (2 + v_purchased_sessions),
      v_purchased_sessions;
  END IF;
END;
$$;

-- Function to consume a purchased session
CREATE OR REPLACE FUNCTION public.consume_purchased_session(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_purchased integer;
BEGIN
  SELECT purchased_sessions INTO v_current_purchased
  FROM profiles WHERE id = p_user_id;
  
  IF v_current_purchased > 0 THEN
    UPDATE profiles 
    SET purchased_sessions = purchased_sessions - 1, updated_at = now()
    WHERE id = p_user_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to add purchased sessions
CREATE OR REPLACE FUNCTION public.add_purchased_sessions(p_user_id uuid, p_count integer DEFAULT 1)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_total integer;
BEGIN
  UPDATE profiles 
  SET purchased_sessions = COALESCE(purchased_sessions, 0) + p_count, updated_at = now()
  WHERE id = p_user_id
  RETURNING purchased_sessions INTO v_new_total;
  
  RETURN COALESCE(v_new_total, p_count);
END;
$$;