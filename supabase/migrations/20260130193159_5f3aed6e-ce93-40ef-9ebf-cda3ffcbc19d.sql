-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_available_sessions(text, activity_type, date, integer);

-- Recreate with age_diff column
CREATE OR REPLACE FUNCTION public.get_available_sessions(
  p_city text,
  p_activity activity_type DEFAULT NULL,
  p_date date DEFAULT NULL,
  p_duration integer DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  creator_id uuid,
  creator_name text,
  creator_avatar text,
  creator_reliability numeric,
  activity activity_type,
  scheduled_date date,
  start_time time,
  duration_minutes integer,
  city text,
  location_name text,
  note text,
  max_participants integer,
  current_participants bigint,
  age_diff integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_birth_year integer;
BEGIN
  -- Get current user's birth year
  SELECT p.birth_year INTO current_user_birth_year
  FROM profiles p
  WHERE p.id = auth.uid();

  RETURN QUERY
  SELECT 
    s.id,
    s.creator_id,
    p.first_name as creator_name,
    p.avatar_url as creator_avatar,
    COALESCE(ur.reliability_score, 100) as creator_reliability,
    s.activity,
    s.scheduled_date,
    s.start_time,
    s.duration_minutes,
    s.city,
    s.location_name,
    s.note,
    s.max_participants,
    (SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = s.id) as current_participants,
    CASE 
      WHEN current_user_birth_year IS NOT NULL AND p.birth_year IS NOT NULL 
      THEN ABS(current_user_birth_year - p.birth_year)::integer
      ELSE 999
    END as age_diff
  FROM scheduled_sessions s
  JOIN profiles p ON s.creator_id = p.id
  LEFT JOIN user_reliability ur ON s.creator_id = ur.user_id
  WHERE s.status = 'open'
    AND s.city = p_city
    AND s.creator_id != auth.uid()
    AND p.shadow_banned = false
    AND (p_activity IS NULL OR s.activity = p_activity)
    AND (p_date IS NULL OR s.scheduled_date = p_date)
    AND (p_duration IS NULL OR s.duration_minutes = p_duration)
    AND (s.scheduled_date > CURRENT_DATE OR (s.scheduled_date = CURRENT_DATE AND s.start_time > CURRENT_TIME))
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks ub 
      WHERE (ub.blocker_id = auth.uid() AND ub.blocked_id = s.creator_id)
         OR (ub.blocker_id = s.creator_id AND ub.blocked_id = auth.uid())
    )
    AND (SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = s.id) < s.max_participants
  ORDER BY 
    -- First by age proximity
    CASE 
      WHEN current_user_birth_year IS NOT NULL AND p.birth_year IS NOT NULL 
      THEN ABS(current_user_birth_year - p.birth_year)
      ELSE 999
    END ASC,
    -- Then by date/time
    s.scheduled_date ASC,
    s.start_time ASC;
END;
$$;