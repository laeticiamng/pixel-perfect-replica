-- Create enum for signal types
CREATE TYPE public.signal_type AS ENUM ('green', 'yellow', 'red');

-- Create enum for activity types
CREATE TYPE public.activity_type AS ENUM ('studying', 'eating', 'working', 'talking', 'sport', 'other');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  avatar_url TEXT,
  university TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_stats table (separate from profiles for performance)
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  interactions INTEGER NOT NULL DEFAULT 0,
  hours_active NUMERIC(10,2) NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
  total_ratings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create active_signals table (users currently broadcasting)
CREATE TABLE public.active_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  signal_type public.signal_type NOT NULL DEFAULT 'green',
  activity public.activity_type NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  accuracy NUMERIC(10,2),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '2 hours')
);

-- Create interactions table (log of all proximity interactions)
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity public.activity_type NOT NULL,
  icebreaker TEXT,
  feedback TEXT CHECK (feedback IN ('positive', 'negative', NULL)),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_users CHECK (user_id != target_user_id)
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  ghost_mode BOOLEAN NOT NULL DEFAULT false,
  visibility_distance INTEGER NOT NULL DEFAULT 200,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  sound_notifications BOOLEAN NOT NULL DEFAULT true,
  proximity_vibration BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table (for safety)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User stats policies
CREATE POLICY "Users can view all stats"
  ON public.user_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Active signals policies
CREATE POLICY "Users can view active signals"
  ON public.active_signals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own signal"
  ON public.active_signals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Interactions policies
CREATE POLICY "Users can view own interactions"
  ON public.interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can create interactions"
  ON public.interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings"
  ON public.user_settings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Create indexes for performance
CREATE INDEX idx_active_signals_location ON public.active_signals (latitude, longitude);
CREATE INDEX idx_active_signals_expires ON public.active_signals (expires_at);
CREATE INDEX idx_interactions_user ON public.interactions (user_id);
CREATE INDEX idx_interactions_target ON public.interactions (target_user_id);
CREATE INDEX idx_interactions_created ON public.interactions (created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile and stats on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur'));
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to clean expired signals
CREATE OR REPLACE FUNCTION public.cleanup_expired_signals()
RETURNS void AS $$
BEGIN
  DELETE FROM public.active_signals WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;