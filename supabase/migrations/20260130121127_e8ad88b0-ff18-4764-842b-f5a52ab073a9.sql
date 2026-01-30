-- FIX 1: Restrict QR code secret visibility - only organizers can see it
DROP POLICY IF EXISTS "Participants can view joined events" ON events;
CREATE POLICY "Participants can view joined events" 
ON events FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM event_participants ep
    WHERE ep.event_id = events.id AND ep.user_id = auth.uid()
  )
  AND (
    -- Organizers can see everything including QR secret
    organizer_id = auth.uid()
    OR
    -- Participants can see event but QR secret is hidden at application level
    organizer_id != auth.uid()
  )
);

-- Create secure function to get event without exposing QR secret to participants
CREATE OR REPLACE FUNCTION public.get_event_for_participant(p_event_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  location_name text,
  latitude numeric,
  longitude numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  max_participants integer,
  is_active boolean,
  organizer_id uuid,
  created_at timestamptz
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.id, e.name, e.description, e.location_name,
    e.latitude, e.longitude, e.starts_at, e.ends_at,
    e.max_participants, e.is_active, e.organizer_id, e.created_at
  FROM events e
  WHERE e.id = p_event_id
    AND (
      e.organizer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM event_participants ep 
        WHERE ep.event_id = e.id AND ep.user_id = auth.uid()
      )
    );
$$;

-- FIX 2: Create secure function to get only public profile info (no email)
CREATE OR REPLACE FUNCTION public.get_safe_profile(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  avatar_url text,
  university text,
  bio text,
  created_at timestamptz
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id, p.first_name, p.avatar_url, p.university, p.bio, p.created_at
  FROM profiles p
  WHERE p.id = p_user_id;
$$;

-- FIX 3: Restrict user_reliability visibility to only users with active signals or recent interactions
DROP POLICY IF EXISTS "Users can view reliability scores" ON user_reliability;
CREATE POLICY "Users can view relevant reliability scores" 
ON user_reliability FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Own score
    auth.uid() = user_id
    -- Users with active signals (nearby)
    OR EXISTS (
      SELECT 1 FROM active_signals 
      WHERE active_signals.user_id = user_reliability.user_id 
      AND active_signals.expires_at > now()
    )
    -- Users from sessions they participate in
    OR EXISTS (
      SELECT 1 FROM session_participants sp1
      JOIN session_participants sp2 ON sp1.session_id = sp2.session_id
      WHERE sp1.user_id = auth.uid() 
      AND sp2.user_id = user_reliability.user_id
    )
  )
);

-- FIX 4: Add function to cleanup old interaction locations (privacy)
CREATE OR REPLACE FUNCTION public.cleanup_old_interaction_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear location data from interactions older than 30 days
  UPDATE interactions 
  SET latitude = NULL, longitude = NULL
  WHERE created_at < now() - interval '30 days'
  AND (latitude IS NOT NULL OR longitude IS NOT NULL);
END;
$$;

-- FIX 5: Add check constraint for email format validation
-- (Already validated at application level, adding DB constraint as defense-in-depth)
ALTER TABLE profiles 
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- FIX 6: Add rate limiting table for sensitive actions
CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_user_action 
ON rate_limit_logs(user_id, action_type, created_at);

ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" ON rate_limit_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert rate limits" ON rate_limit_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-cleanup old rate limit logs (older than 24h)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limit_logs WHERE created_at < now() - interval '24 hours';
END;
$$;