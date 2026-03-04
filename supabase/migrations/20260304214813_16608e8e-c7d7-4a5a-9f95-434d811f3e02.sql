
-- RPC to discover users: recently active, filterable by activity/university
-- Returns users who had an active signal in the last 7 days or have matching favorite activities
-- Excludes: current user, blocked users, shadow-banned users, ghost mode users
CREATE OR REPLACE FUNCTION public.discover_users(
  p_activity text DEFAULT NULL,
  p_university text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  user_id uuid,
  first_name text,
  avatar_url text,
  university text,
  favorite_activities text[],
  last_active_at timestamptz,
  is_online_now boolean,
  current_activity text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    p.id as user_id,
    p.first_name,
    p.avatar_url,
    p.university,
    p.favorite_activities,
    COALESCE(last_sig.last_active, p.created_at) as last_active_at,
    (active_now.user_id IS NOT NULL) as is_online_now,
    active_now.activity::text as current_activity
  FROM profiles p
  LEFT JOIN LATERAL (
    SELECT MAX(s.started_at) as last_active
    FROM active_signals s
    WHERE s.user_id = p.id
  ) last_sig ON true
  LEFT JOIN LATERAL (
    SELECT s.user_id, s.activity
    FROM active_signals s
    WHERE s.user_id = p.id
      AND s.expires_at > now()
    LIMIT 1
  ) active_now ON true
  LEFT JOIN user_settings us ON us.user_id = p.id
  WHERE p.id != auth.uid()
    AND (p.shadow_banned = false OR p.shadow_banned IS NULL)
    AND (us.ghost_mode IS NULL OR us.ghost_mode = false)
    -- Exclude blocked users
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = p.id)
         OR (blocker_id = p.id AND blocked_id = auth.uid())
    )
    -- Filter by activity (matches favorite_activities or current signal)
    AND (p_activity IS NULL OR p_activity = ANY(p.favorite_activities) OR active_now.activity::text = p_activity)
    -- Filter by university
    AND (p_university IS NULL OR p.university = p_university)
    -- Search by name
    AND (p_search IS NULL OR p.first_name ILIKE '%' || p_search || '%')
  ORDER BY
    -- Online now first
    (active_now.user_id IS NOT NULL) DESC,
    -- Then by recency
    COALESCE(last_sig.last_active, p.created_at) DESC
  LIMIT p_limit;
$$;
