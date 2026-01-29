-- =============================================
-- MODE BINOME: Tables pour sessions planifiées
-- =============================================

-- 1. Table des sessions planifiées
CREATE TABLE public.scheduled_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (45, 90, 180)),
  activity public.activity_type NOT NULL,
  city TEXT NOT NULL,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  note TEXT,
  max_participants INTEGER NOT NULL DEFAULT 3 CHECK (max_participants >= 1 AND max_participants <= 10),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour recherche par date et ville
CREATE INDEX idx_scheduled_sessions_date ON public.scheduled_sessions(scheduled_date);
CREATE INDEX idx_scheduled_sessions_city ON public.scheduled_sessions(city);
CREATE INDEX idx_scheduled_sessions_status ON public.scheduled_sessions(status);

-- Trigger updated_at
CREATE TRIGGER update_scheduled_sessions_updated_at
  BEFORE UPDATE ON public.scheduled_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Table des participants aux sessions
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.scheduled_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out BOOLEAN NOT NULL DEFAULT false,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  reminder_1h_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_15m_sent BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX idx_session_participants_user ON public.session_participants(user_id);

-- 3. Table des feedbacks post-session
CREATE TABLE public.session_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.scheduled_sessions(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  punctual BOOLEAN NOT NULL DEFAULT true,
  pleasant BOOLEAN NOT NULL DEFAULT true,
  would_recommend BOOLEAN NOT NULL DEFAULT true,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, from_user_id, to_user_id)
);

CREATE INDEX idx_session_feedback_session ON public.session_feedback(session_id);
CREATE INDEX idx_session_feedback_to_user ON public.session_feedback(to_user_id);

-- 4. Table de fiabilité utilisateur
CREATE TABLE public.user_reliability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  sessions_created INTEGER NOT NULL DEFAULT 0,
  sessions_joined INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  no_shows INTEGER NOT NULL DEFAULT 0,
  late_cancellations INTEGER NOT NULL DEFAULT 0,
  positive_feedback_count INTEGER NOT NULL DEFAULT 0,
  total_feedback_count INTEGER NOT NULL DEFAULT 0,
  reliability_score NUMERIC NOT NULL DEFAULT 100 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_reliability_score ON public.user_reliability(reliability_score);

-- Trigger updated_at
CREATE TRIGGER update_user_reliability_updated_at
  BEFORE UPDATE ON public.user_reliability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reliability ENABLE ROW LEVEL SECURITY;

-- scheduled_sessions policies
CREATE POLICY "Users can view open sessions in same city"
  ON public.scheduled_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL AND (status = 'open' OR creator_id = auth.uid()));

CREATE POLICY "Authenticated users can create sessions"
  ON public.scheduled_sessions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own sessions"
  ON public.scheduled_sessions FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own sessions before start"
  ON public.scheduled_sessions FOR DELETE
  USING (auth.uid() = creator_id AND (scheduled_date > CURRENT_DATE OR (scheduled_date = CURRENT_DATE AND start_time > CURRENT_TIME)));

-- session_participants policies
CREATE POLICY "Participants can view session members"
  ON public.session_participants FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.scheduled_sessions s WHERE s.id = session_id AND s.creator_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.session_participants sp WHERE sp.session_id = session_participants.session_id AND sp.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can join sessions"
  ON public.session_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions"
  ON public.session_participants FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can update participant check-in"
  ON public.session_participants FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.scheduled_sessions s WHERE s.id = session_id AND s.creator_id = auth.uid()) OR
    auth.uid() = user_id
  );

-- session_feedback policies
CREATE POLICY "Users can view feedback about themselves"
  ON public.session_feedback FOR SELECT
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

CREATE POLICY "Participants can give feedback"
  ON public.session_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (
      SELECT 1 FROM public.session_participants sp 
      WHERE sp.session_id = session_feedback.session_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Feedback is immutable"
  ON public.session_feedback FOR UPDATE
  USING (false);

CREATE POLICY "Feedback cannot be deleted"
  ON public.session_feedback FOR DELETE
  USING (false);

-- user_reliability policies
CREATE POLICY "Users can view reliability scores"
  ON public.user_reliability FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own reliability"
  ON public.user_reliability FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System updates reliability via RPC"
  ON public.user_reliability FOR UPDATE
  USING (false);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get available sessions for a city
CREATE OR REPLACE FUNCTION public.get_available_sessions(
  p_city TEXT,
  p_activity public.activity_type DEFAULT NULL,
  p_date DATE DEFAULT NULL,
  p_duration INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  creator_name TEXT,
  creator_avatar TEXT,
  creator_reliability NUMERIC,
  scheduled_date DATE,
  start_time TIME,
  duration_minutes INTEGER,
  activity public.activity_type,
  city TEXT,
  location_name TEXT,
  note TEXT,
  max_participants INTEGER,
  current_participants BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.creator_id,
    p.first_name as creator_name,
    p.avatar_url as creator_avatar,
    COALESCE(ur.reliability_score, 100) as creator_reliability,
    s.scheduled_date,
    s.start_time,
    s.duration_minutes,
    s.activity,
    s.city,
    s.location_name,
    s.note,
    s.max_participants,
    (SELECT COUNT(*) FROM public.session_participants sp WHERE sp.session_id = s.id) as current_participants,
    s.created_at
  FROM public.scheduled_sessions s
  JOIN public.profiles p ON p.id = s.creator_id
  LEFT JOIN public.user_reliability ur ON ur.user_id = s.creator_id
  WHERE s.status = 'open'
    AND LOWER(s.city) = LOWER(p_city)
    AND (s.scheduled_date > CURRENT_DATE OR (s.scheduled_date = CURRENT_DATE AND s.start_time > CURRENT_TIME))
    AND (p_activity IS NULL OR s.activity = p_activity)
    AND (p_date IS NULL OR s.scheduled_date = p_date)
    AND (p_duration IS NULL OR s.duration_minutes = p_duration)
    AND s.creator_id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_blocks 
      WHERE (blocker_id = auth.uid() AND blocked_id = s.creator_id)
         OR (blocker_id = s.creator_id AND blocked_id = auth.uid())
    )
  ORDER BY s.scheduled_date ASC, s.start_time ASC;
$$;

-- Function to join a session
CREATE OR REPLACE FUNCTION public.join_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_participants INTEGER;
  v_current_count INTEGER;
  v_session_status TEXT;
BEGIN
  -- Check session exists and is open
  SELECT max_participants, status INTO v_max_participants, v_session_status
  FROM public.scheduled_sessions
  WHERE id = p_session_id;
  
  IF v_session_status IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  IF v_session_status != 'open' THEN
    RAISE EXCEPTION 'Session is not open for joining';
  END IF;
  
  -- Count current participants
  SELECT COUNT(*) INTO v_current_count
  FROM public.session_participants
  WHERE session_id = p_session_id;
  
  IF v_current_count >= v_max_participants THEN
    RAISE EXCEPTION 'Session is full';
  END IF;
  
  -- Insert participant
  INSERT INTO public.session_participants (session_id, user_id)
  VALUES (p_session_id, auth.uid());
  
  -- Update session status if now full
  IF v_current_count + 1 >= v_max_participants THEN
    UPDATE public.scheduled_sessions SET status = 'full' WHERE id = p_session_id;
  END IF;
  
  -- Update user reliability stats
  INSERT INTO public.user_reliability (user_id, sessions_joined)
  VALUES (auth.uid(), 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET sessions_joined = user_reliability.sessions_joined + 1;
  
  RETURN TRUE;
END;
$$;

-- Function to leave a session
CREATE OR REPLACE FUNCTION public.leave_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_date DATE;
  v_session_time TIME;
  v_hours_until_session NUMERIC;
BEGIN
  -- Get session timing
  SELECT scheduled_date, start_time INTO v_session_date, v_session_time
  FROM public.scheduled_sessions
  WHERE id = p_session_id;
  
  -- Calculate hours until session
  v_hours_until_session := EXTRACT(EPOCH FROM (v_session_date + v_session_time - NOW())) / 3600;
  
  -- Delete participation
  DELETE FROM public.session_participants
  WHERE session_id = p_session_id AND user_id = auth.uid();
  
  -- Update session status back to open if was full
  UPDATE public.scheduled_sessions 
  SET status = 'open' 
  WHERE id = p_session_id AND status = 'full';
  
  -- Record late cancellation if less than 2 hours
  IF v_hours_until_session < 2 THEN
    UPDATE public.user_reliability
    SET late_cancellations = late_cancellations + 1,
        reliability_score = GREATEST(0, reliability_score - 5)
    WHERE user_id = auth.uid();
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to get sessions needing reminders
CREATE OR REPLACE FUNCTION public.get_sessions_needing_reminders()
RETURNS TABLE (
  session_id UUID,
  participant_id UUID,
  user_id UUID,
  reminder_type TEXT,
  session_date DATE,
  start_time TIME,
  activity public.activity_type,
  city TEXT,
  location_name TEXT,
  creator_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id as session_id,
    sp.id as participant_id,
    sp.user_id,
    CASE 
      WHEN NOT sp.reminder_1h_sent AND 
           (s.scheduled_date + s.start_time - INTERVAL '1 hour') <= NOW() AND
           (s.scheduled_date + s.start_time) > NOW()
      THEN '1h'
      WHEN NOT sp.reminder_15m_sent AND 
           (s.scheduled_date + s.start_time - INTERVAL '15 minutes') <= NOW() AND
           (s.scheduled_date + s.start_time) > NOW()
      THEN '15m'
    END as reminder_type,
    s.scheduled_date,
    s.start_time,
    s.activity,
    s.city,
    s.location_name,
    p.first_name as creator_name
  FROM public.scheduled_sessions s
  JOIN public.session_participants sp ON sp.session_id = s.id
  JOIN public.profiles p ON p.id = s.creator_id
  WHERE s.status IN ('open', 'full')
    AND (
      (NOT sp.reminder_1h_sent AND (s.scheduled_date + s.start_time - INTERVAL '1 hour') <= NOW() AND (s.scheduled_date + s.start_time) > NOW())
      OR
      (NOT sp.reminder_15m_sent AND (s.scheduled_date + s.start_time - INTERVAL '15 minutes') <= NOW() AND (s.scheduled_date + s.start_time) > NOW())
    );
$$;

-- Initialize user_reliability for existing users
INSERT INTO public.user_reliability (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;