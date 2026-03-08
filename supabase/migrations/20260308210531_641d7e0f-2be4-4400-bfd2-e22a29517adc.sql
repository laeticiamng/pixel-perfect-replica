-- Fix infinite recursion in event_participants SELECT policy
-- Drop the broken policy
DROP POLICY IF EXISTS "Participants can view event members" ON public.event_participants;

-- Create a fixed policy: users can see their own participations + organizers can see all participants of their events
CREATE POLICY "Users can view own participations"
ON public.event_participants
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_participants.event_id AND e.organizer_id = auth.uid()
  )
);