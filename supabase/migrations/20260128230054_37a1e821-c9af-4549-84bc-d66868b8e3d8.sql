-- 1. Fix RLS policies for profiles - restrict email visibility
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view nearby user profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.active_signals 
    WHERE user_id = profiles.id 
    AND expires_at > now()
  )
);

-- 2. Fix RLS for active_signals - only show non-expired and respect ghost mode
DROP POLICY IF EXISTS "Users can view active signals" ON public.active_signals;

CREATE POLICY "Users can view active signals"
ON public.active_signals FOR SELECT
USING (
  expires_at > now() 
  AND (
    user_id = auth.uid() 
    OR NOT EXISTS (
      SELECT 1 FROM public.user_settings 
      WHERE user_settings.user_id = active_signals.user_id 
      AND ghost_mode = true
    )
  )
);

-- 3. Remove redundant policy on user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;

-- 4. Add UPDATE policy for interactions (feedback)
CREATE POLICY "Users can update own interactions"
ON public.interactions FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Create app_feedback table for storing user feedback
CREATE TABLE IF NOT EXISTS public.app_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback"
ON public.app_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
ON public.app_feedback FOR SELECT
USING (auth.uid() = user_id);

-- 6. Create trigger for auto-creating user_stats and user_settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur'));
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create view for safe profile exposure (without email)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
SELECT 
  id,
  first_name,
  avatar_url,
  university,
  created_at
FROM public.profiles;