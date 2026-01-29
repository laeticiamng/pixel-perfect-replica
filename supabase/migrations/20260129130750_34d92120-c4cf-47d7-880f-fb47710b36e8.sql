-- =====================================================
-- SECURITY FIX: Correct all RLS policy issues
-- =====================================================

-- 1. Fix profiles table: Remove policy that could expose emails
DROP POLICY IF EXISTS "Users can view profiles of people they interact with" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;

-- Only allow users to see their OWN profile (with email)
CREATE POLICY "Users can view own profile only"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Fix profiles_public view with proper RLS
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    first_name,
    avatar_url,
    university,
    bio,
    created_at
  FROM public.profiles;

-- Enable RLS on the view (via base table)
COMMENT ON VIEW public.profiles_public IS 'Public profile view without email - for display to other users';

-- 3. Fix emergency_contacts policy - simplify
DROP POLICY IF EXISTS "Deny anonymous access to emergency_contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can manage their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can view their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can insert their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can delete their own emergency contacts" ON public.emergency_contacts;

-- Single clear policy for all operations
CREATE POLICY "Users manage own emergency contacts"
  ON public.emergency_contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Update get_safe_public_profile to be the ONLY way to fetch other users' profiles
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  avatar_url text,
  university text,
  created_at timestamptz
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
    p.university,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;

-- 5. Ensure interactions cleanup is working
CREATE OR REPLACE FUNCTION public.cleanup_old_interaction_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nullify location data from interactions older than 7 days
  UPDATE interactions
  SET latitude = NULL, longitude = NULL
  WHERE created_at < NOW() - INTERVAL '7 days'
    AND (latitude IS NOT NULL OR longitude IS NOT NULL);
END;
$$;

-- 6. Add index for faster cleanup
CREATE INDEX IF NOT EXISTS idx_interactions_location_cleanup 
  ON interactions(created_at) 
  WHERE latitude IS NOT NULL OR longitude IS NOT NULL;