-- Table pour les messages de session (chat de groupe)
CREATE TABLE public.session_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.scheduled_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;

-- Participants and creator can view messages
CREATE POLICY "Session participants can view messages"
ON public.session_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.session_participants sp 
    WHERE sp.session_id = session_messages.session_id 
    AND sp.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.scheduled_sessions ss 
    WHERE ss.id = session_messages.session_id 
    AND ss.creator_id = auth.uid()
  )
);

-- Participants and creator can send messages
CREATE POLICY "Session participants can send messages"
ON public.session_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.session_participants sp 
      WHERE sp.session_id = session_messages.session_id 
      AND sp.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.scheduled_sessions ss 
      WHERE ss.id = session_messages.session_id 
      AND ss.creator_id = auth.uid()
    )
  )
);

-- Enable realtime for session messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages;

-- Function to update reliability from feedback
CREATE OR REPLACE FUNCTION public.update_reliability_from_feedback(
  p_user_id UUID,
  p_positive BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_reliability (user_id, total_feedback_count, positive_feedback_count)
  VALUES (
    p_user_id, 
    1, 
    CASE WHEN p_positive THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_feedback_count = user_reliability.total_feedback_count + 1,
    positive_feedback_count = user_reliability.positive_feedback_count + CASE WHEN p_positive THEN 1 ELSE 0 END,
    reliability_score = CASE 
      WHEN user_reliability.total_feedback_count + 1 > 0 
      THEN ROUND(
        (user_reliability.positive_feedback_count + CASE WHEN p_positive THEN 1 ELSE 0 END)::numeric 
        / (user_reliability.total_feedback_count + 1)::numeric * 100, 
        2
      )
      ELSE 100 
    END,
    updated_at = now();
END;
$$;

-- Enable pg_cron and pg_net extensions for scheduled reminders
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;