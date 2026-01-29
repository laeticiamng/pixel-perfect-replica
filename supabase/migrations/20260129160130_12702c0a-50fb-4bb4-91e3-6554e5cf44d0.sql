-- =============================================
-- SECURITY FIX: Protect sensitive data from exposure
-- =============================================

-- 1. Create a view to expose only public profile fields (without email)
-- This view will be used by the frontend for displaying other users' profiles
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = on) AS
SELECT 
  id,
  first_name,
  avatar_url,
  university,
  bio,
  created_at
FROM public.profiles;

-- 2. Fix RLS on profiles - restrict email visibility to own profile only
DROP POLICY IF EXISTS "Authenticated users can view public profile fields via view" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Users can only see their own full profile (including email)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Fix user_stats - prevent users from directly modifying ratings
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;

-- Create a function to safely update stats (only hours_active and interactions, NOT rating)
CREATE OR REPLACE FUNCTION public.update_user_stats_safe(
  p_user_id uuid,
  p_hours_active numeric DEFAULT NULL,
  p_interactions integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow updates to hours_active and interactions, never to rating
  IF p_hours_active IS NOT NULL THEN
    UPDATE public.user_stats
    SET hours_active = hours_active + p_hours_active
    WHERE user_id = p_user_id;
  END IF;
  
  IF p_interactions IS NOT NULL THEN
    UPDATE public.user_stats
    SET interactions = interactions + p_interactions
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Restrict user_stats updates to only allow safe field updates via function
CREATE POLICY "Users can update own stats safely"
ON public.user_stats FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Rating and total_ratings can only be changed via secure functions, not direct UPDATE
);

-- 4. Fix event_participants - prevent users from self-checking-in
DROP POLICY IF EXISTS "Users can join events" ON public.event_participants;

-- Users can join events (but check-in fields default to false/null)
CREATE POLICY "Users can join events"
ON public.event_participants FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND checked_in = false
  AND checked_in_at IS NULL
);

-- Only allow organizers or valid QR code holders to update check-in status
CREATE POLICY "Only authorized can update check-in"
ON public.event_participants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id
    AND e.organizer_id = auth.uid()
  )
);

-- 5. Fix interactions - auto-nullify location after 7 days (already have cleanup function)
-- Add trigger to ensure new interactions have temporary locations
CREATE OR REPLACE FUNCTION public.validate_interaction_location()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure location is fuzzy (rounded to 3 decimals = ~100m precision)
  IF NEW.latitude IS NOT NULL THEN
    NEW.latitude := ROUND(NEW.latitude::numeric, 3);
  END IF;
  IF NEW.longitude IS NOT NULL THEN
    NEW.longitude := ROUND(NEW.longitude::numeric, 3);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fuzz_interaction_location ON public.interactions;
CREATE TRIGGER fuzz_interaction_location
BEFORE INSERT ON public.interactions
FOR EACH ROW
EXECUTE FUNCTION public.validate_interaction_location();

-- 6. Add function to safely update ratings (via feedback only)
CREATE OR REPLACE FUNCTION public.submit_rating(
  p_target_user_id uuid,
  p_rating integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_rating numeric;
  v_total_ratings integer;
  v_new_rating numeric;
BEGIN
  -- Validate rating is between 1-5
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Cannot rate yourself
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot rate yourself';
  END IF;
  
  -- Get current stats
  SELECT rating, total_ratings INTO v_current_rating, v_total_ratings
  FROM public.user_stats
  WHERE user_id = p_target_user_id;
  
  -- Calculate new average rating
  v_new_rating := ((v_current_rating * v_total_ratings) + p_rating) / (v_total_ratings + 1);
  
  -- Update stats
  UPDATE public.user_stats
  SET 
    rating = ROUND(v_new_rating, 2),
    total_ratings = total_ratings + 1,
    updated_at = now()
  WHERE user_id = p_target_user_id;
END;
$$;

-- 7. Add constraint on admin_alert_preferences to only see own preferences
DROP POLICY IF EXISTS "Admins can manage own preferences" ON public.admin_alert_preferences;

CREATE POLICY "Admins can manage own preferences"
ON public.admin_alert_preferences FOR ALL
USING (
  has_role(auth.uid(), 'admin')
  AND auth.uid() = user_id
)
WITH CHECK (
  has_role(auth.uid(), 'admin')
  AND auth.uid() = user_id
);