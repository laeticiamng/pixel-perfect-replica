-- Add favorite activities to profiles (6 max according to ticket)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS favorite_activities text[] DEFAULT '{}';

-- Add constraint for max 6 activities
ALTER TABLE public.profiles
ADD CONSTRAINT check_max_favorite_activities CHECK (array_length(favorite_activities, 1) IS NULL OR array_length(favorite_activities, 1) <= 6);

-- Add verification badges table
CREATE TABLE IF NOT EXISTS public.verification_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL CHECK (badge_type IN ('email_edu', 'linkedin', 'instagram', 'photo_liveness')),
  verified_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, badge_type)
);

-- Enable RLS
ALTER TABLE public.verification_badges ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own badges
CREATE POLICY "Users can view own badges"
ON public.verification_badges
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Users can view public badges of nearby users
CREATE POLICY "Authenticated users can view badges of active users"
ON public.verification_badges
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.active_signals 
    WHERE active_signals.user_id = verification_badges.user_id 
    AND active_signals.expires_at > now()
  )
);

-- Only service role can manage badges (security)
CREATE POLICY "Service role manages badges"
ON public.verification_badges
FOR ALL
USING (false)
WITH CHECK (false);

-- Create messages table for mini-chat (10 messages max)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_id uuid NOT NULL REFERENCES public.interactions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 500),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS: Participants can view messages
CREATE POLICY "Participants can view messages"
ON public.messages
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM interactions WHERE id = messages.interaction_id
    UNION
    SELECT target_user_id FROM interactions WHERE id = messages.interaction_id
  )
);

-- RLS: Participants can create messages (max 10 per interaction enforced in code)
CREATE POLICY "Participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND auth.uid() IN (
    SELECT user_id FROM interactions WHERE id = messages.interaction_id
    UNION
    SELECT target_user_id FROM interactions WHERE id = messages.interaction_id
  )
);

-- Messages cannot be updated or deleted
CREATE POLICY "Messages are immutable"
ON public.messages
FOR UPDATE
USING (false);

CREATE POLICY "Messages cannot be deleted by users"
ON public.messages
FOR DELETE
USING (false);

-- Create events table for Event Mode
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) <= 100),
  description text CHECK (char_length(description) <= 500),
  location_name text NOT NULL CHECK (char_length(location_name) <= 200),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  qr_code_secret text NOT NULL DEFAULT gen_random_uuid()::text,
  max_participants integer DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can view active events
CREATE POLICY "Everyone can view active events"
ON public.events
FOR SELECT
USING (is_active = true AND ends_at > now());

-- RLS: Organizers can manage their events
CREATE POLICY "Organizers can manage own events"
ON public.events
FOR ALL
USING (auth.uid() = organizer_id)
WITH CHECK (auth.uid() = organizer_id);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS public.event_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  checked_in boolean NOT NULL DEFAULT false,
  checked_in_at timestamp with time zone,
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- RLS: Participants can view other participants of same event
CREATE POLICY "Participants can view event members"
ON public.event_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM event_participants ep 
    WHERE ep.event_id = event_participants.event_id 
    AND ep.user_id = auth.uid()
  )
);

-- RLS: Users can join events
CREATE POLICY "Users can join events"
ON public.event_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS: Users can leave events
CREATE POLICY "Users can leave events"
ON public.event_participants
FOR DELETE
USING (auth.uid() = user_id);

-- Add event_id to active_signals for event-scoped signals
ALTER TABLE public.active_signals
ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;

-- Create index for event lookup
CREATE INDEX IF NOT EXISTS idx_active_signals_event ON public.active_signals(event_id) WHERE event_id IS NOT NULL;

-- Create index for messages lookup
CREATE INDEX IF NOT EXISTS idx_messages_interaction ON public.messages(interaction_id);

-- Create index for event participants
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Update trigger for events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();