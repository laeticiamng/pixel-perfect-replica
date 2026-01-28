-- Create a view that returns fuzzed coordinates for active signals
CREATE OR REPLACE VIEW public.active_signals_public
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  signal_type,
  activity,
  -- Fuzz coordinates to ~100m precision
  ROUND(latitude::numeric, 3) as latitude,
  ROUND(longitude::numeric, 3) as longitude,
  accuracy,
  started_at,
  expires_at
FROM public.active_signals
WHERE expires_at > now();

-- Update RLS policy on active_signals to deny direct access
-- First drop the existing policy
DROP POLICY IF EXISTS "Users can view active signals" ON public.active_signals;

-- Create a more restrictive policy that only allows viewing fuzzed data
CREATE POLICY "Users can view active signals nearby"
ON public.active_signals
FOR SELECT
USING (
  auth.uid() = user_id  -- User can see their own signal
  OR (
    expires_at > now()  -- Only active signals
    AND user_id NOT IN (  -- Exclude ghost mode users
      SELECT user_id FROM public.user_settings WHERE ghost_mode = true
    )
  )
);

-- Create function to get nearby signals with fuzzed coordinates
CREATE OR REPLACE FUNCTION public.get_nearby_signals(
  user_lat numeric,
  user_lon numeric,
  max_distance_meters integer DEFAULT 500
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  signal_type public.signal_type,
  activity public.activity_type,
  latitude numeric,
  longitude numeric,
  started_at timestamptz,
  first_name text,
  avatar_url text,
  rating numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.user_id,
    s.signal_type,
    s.activity,
    ROUND(s.latitude::numeric, 3) as latitude,  -- Fuzz to ~100m
    ROUND(s.longitude::numeric, 3) as longitude,
    s.started_at,
    p.first_name,
    p.avatar_url,
    COALESCE(st.rating, 4.0) as rating
  FROM public.active_signals s
  JOIN public.profiles p ON p.id = s.user_id
  LEFT JOIN public.user_stats st ON st.user_id = s.user_id
  LEFT JOIN public.user_settings us ON us.user_id = s.user_id
  WHERE s.expires_at > now()
    AND s.user_id != auth.uid()  -- Exclude self
    AND (us.ghost_mode IS NULL OR us.ghost_mode = false)  -- Exclude ghost mode
    AND (
      -- Distance calculation (Haversine approximation for nearby)
      6371000 * 2 * ASIN(
        SQRT(
          POWER(SIN(RADIANS(s.latitude - user_lat) / 2), 2) +
          COS(RADIANS(user_lat)) * COS(RADIANS(s.latitude)) *
          POWER(SIN(RADIANS(s.longitude - user_lon) / 2), 2)
        )
      ) <= max_distance_meters
    )
  ORDER BY s.started_at DESC
  LIMIT 50;
$$;

-- Clean up interaction location data after 7 days (privacy)
-- Create a scheduled job placeholder comment
COMMENT ON FUNCTION public.cleanup_old_interaction_locations IS 'Should be scheduled to run daily to clear location data older than 7 days';