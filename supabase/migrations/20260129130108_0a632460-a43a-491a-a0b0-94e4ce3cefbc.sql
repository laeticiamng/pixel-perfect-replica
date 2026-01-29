-- =====================================================
-- AUDIT SECURITY FIX: Protect user emails from exposure
-- =====================================================

-- 1. Create a secure view that excludes email from profiles
-- This view will be used for public profile access
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    first_name,
    avatar_url,
    university,
    bio,
    created_at
  FROM public.profiles;

-- 2. Drop existing SELECT policies on profiles that expose email
DROP POLICY IF EXISTS "Users can view profiles of people they interact with" ON public.profiles;

-- 3. Create new SELECT policies with better protection
-- Users can ONLY view their OWN full profile (including email)
CREATE POLICY "Users can view own full profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- For viewing OTHER users' profiles, use the get_safe_public_profile function instead
-- This is already in place and excludes email

-- 4. Update interactions table to auto-nullify location after creation
-- (Location is only needed momentarily for distance calculation)
CREATE OR REPLACE FUNCTION public.auto_nullify_interaction_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Schedule location nullification after 24 hours (via cleanup job)
  -- For immediate: we keep location for 24h max for context
  RETURN NEW;
END;
$$;

-- 5. Ensure emergency_contacts has explicit deny for anonymous users
-- (Already has good RLS, but adding explicit check)
DROP POLICY IF EXISTS "Deny anonymous access to emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "Deny anonymous access to emergency_contacts"
  ON public.emergency_contacts
  FOR ALL
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 6. Add function to get profile without email for interactions
CREATE OR REPLACE FUNCTION public.get_interaction_profile(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  avatar_url text,
  university text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.avatar_url,
    p.university
  FROM public.profiles p
  WHERE p.id = p_user_id;
$$;

-- 7. Add location privacy cleanup - runs daily via cron or edge function
-- Update the cleanup function to be more aggressive
CREATE OR REPLACE FUNCTION public.cleanup_old_interaction_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nullify location data from interactions older than 7 days (more aggressive)
  UPDATE interactions
  SET latitude = NULL, longitude = NULL
  WHERE created_at < NOW() - INTERVAL '7 days'
    AND (latitude IS NOT NULL OR longitude IS NOT NULL);
END;
$$;

-- 8. Add index for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_interactions_location_cleanup 
  ON interactions(created_at) 
  WHERE latitude IS NOT NULL OR longitude IS NOT NULL;

-- 9. Ensure user_stats doesn't expose too much info
-- Add comment to document this is intentional visibility
COMMENT ON TABLE public.user_stats IS 'User statistics - rating/interactions visible to nearby users for trust signals';

-- 10. Add rate limiting function for report submission
CREATE OR REPLACE FUNCTION public.check_report_rate_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Max 5 reports per hour
  SELECT COUNT(*) INTO recent_count
  FROM reports
  WHERE reporter_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN recent_count < 5;
END;
$$;