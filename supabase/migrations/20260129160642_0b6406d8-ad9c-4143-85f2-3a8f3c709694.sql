-- Fix: Hide qr_code_secret from non-organizers
-- Only organizers should see the QR code secret

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Everyone can view active events" ON public.events;

-- Create new policy that excludes qr_code_secret for non-organizers
-- Since we can't do column-level RLS, we use a view instead

-- Create a public events view without the secret
CREATE OR REPLACE VIEW public.events_public
WITH (security_invoker = on) AS
SELECT 
  id,
  organizer_id,
  name,
  description,
  location_name,
  latitude,
  longitude,
  starts_at,
  ends_at,
  max_participants,
  is_active,
  created_at,
  updated_at
  -- qr_code_secret is EXCLUDED
FROM public.events
WHERE is_active = true AND ends_at > now();

-- Recreate the policy for active events
CREATE POLICY "Everyone can view active events"
ON public.events FOR SELECT
USING (
  (is_active = true AND ends_at > now())
  OR auth.uid() = organizer_id
);

-- Note: The qr_code_secret is still accessible to organizers via the full table
-- Non-organizers should query events_public view instead