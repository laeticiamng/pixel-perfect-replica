-- Add policy for session participants to be viewable by session members
CREATE POLICY "Session members can view session participants"
ON public.session_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.session_participants sp 
    WHERE sp.session_id = session_participants.session_id 
    AND sp.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.scheduled_sessions ss 
    WHERE ss.id = session_participants.session_id 
    AND ss.creator_id = auth.uid()
  )
);