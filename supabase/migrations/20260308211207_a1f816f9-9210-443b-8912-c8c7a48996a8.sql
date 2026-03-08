-- Fix: Allow authenticated users to see active events (not just organizers)
-- Currently only organizers can see their own events, which means the Events page is empty for everyone else

CREATE POLICY "Authenticated users can view active events"
ON public.events
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND ends_at > now()
);
