-- Create table for user testimonials
CREATE TABLE public.user_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.scheduled_sessions(id) ON DELETE CASCADE,
  quote TEXT NOT NULL,
  activity TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_testimonials ENABLE ROW LEVEL SECURITY;

-- Users can submit testimonials for their completed sessions
CREATE POLICY "Users can submit testimonials for participated sessions"
ON public.user_testimonials
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.session_participants sp 
    WHERE sp.session_id = user_testimonials.session_id 
    AND sp.user_id = auth.uid()
    AND sp.checked_out = true
  )
);

-- Users can view their own testimonials
CREATE POLICY "Users can view own testimonials"
ON public.user_testimonials
FOR SELECT
USING (auth.uid() = user_id);

-- Everyone can view approved testimonials
CREATE POLICY "Everyone can view approved testimonials"
ON public.user_testimonials
FOR SELECT
USING (is_approved = true);

-- Admins can approve testimonials
CREATE POLICY "Admins can update testimonials"
ON public.user_testimonials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create a function to get community stats
CREATE OR REPLACE FUNCTION public.get_community_stats()
RETURNS TABLE(
  active_users_now BIGINT,
  sessions_this_month BIGINT,
  completed_sessions BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.active_signals WHERE expires_at > now()) as active_users_now,
    (SELECT COUNT(*) FROM public.scheduled_sessions WHERE created_at >= date_trunc('month', now())) as sessions_this_month,
    (SELECT COUNT(*) FROM public.session_participants WHERE checked_out = true) as completed_sessions;
$$;

-- Create index for performance
CREATE INDEX idx_user_testimonials_approved ON public.user_testimonials(is_approved) WHERE is_approved = true;
CREATE INDEX idx_user_testimonials_session ON public.user_testimonials(session_id);