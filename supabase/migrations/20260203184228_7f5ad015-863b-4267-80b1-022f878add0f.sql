-- Fix: Prevent participants from seeing qr_code_secret
-- Drop the existing policy that exposes qr_code_secret to participants
DROP POLICY IF EXISTS "Participants can view joined events" ON public.events;

-- Create a secure function that returns event data WITHOUT qr_code_secret for participants
CREATE OR REPLACE FUNCTION public.get_event_for_participant_secure(p_event_id uuid)
RETURNS TABLE(
  id uuid, 
  name text, 
  description text, 
  location_name text,
  latitude numeric, 
  longitude numeric, 
  starts_at timestamp with time zone, 
  ends_at timestamp with time zone,
  max_participants integer, 
  is_active boolean, 
  organizer_id uuid, 
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.id, e.name, e.description, e.location_name,
    e.latitude, e.longitude, e.starts_at, e.ends_at,
    e.max_participants, e.is_active, e.organizer_id, e.created_at
    -- NOTE: qr_code_secret is intentionally EXCLUDED
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

-- Add comment explaining the security decision
COMMENT ON FUNCTION public.get_event_for_participant_secure IS 'Returns event details for participants WITHOUT exposing qr_code_secret. Organizers should use get_event_for_user() which includes the secret.';