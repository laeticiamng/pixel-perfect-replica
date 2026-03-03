
-- Fix infinite recursion: drop the two recursive SELECT policies
DROP POLICY IF EXISTS "Participants can view session members" ON public.session_participants;
DROP POLICY IF EXISTS "Session members can view session participants" ON public.session_participants;

-- Create a single non-recursive SELECT policy
CREATE POLICY "Users can view session participants"
ON public.session_participants
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM scheduled_sessions s
      WHERE s.id = session_participants.session_id
      AND s.creator_id = auth.uid()
    )
  )
);

-- Also create a security definer function for checking participation without RLS recursion
CREATE OR REPLACE FUNCTION public.is_session_participant(p_session_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.session_participants
    WHERE session_id = p_session_id AND user_id = p_user_id
  )
$$;
