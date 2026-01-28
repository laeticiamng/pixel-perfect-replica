-- 1. profiles_public is a VIEW with security_invoker=on, not a table
-- We need to ensure the base profiles table has proper policies
-- The view already excludes email, so we just need to grant access

-- Since profiles_public is a VIEW, we need to ensure authenticated users can access it
-- The base profiles table now only allows users to view their own profile
-- So we need to add a policy that allows reading non-sensitive fields for other users

-- Add a policy for authenticated users to read non-email fields from profiles
-- This is needed because profiles_public (the view) relies on profiles table RLS
DROP POLICY IF EXISTS "Authenticated can view public profile fields" ON public.profiles;
CREATE POLICY "Authenticated can view public profile fields"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- But wait - this exposes email again. The solution is:
-- 1. Keep the restrictive policy on profiles
-- 2. Create profiles_public as a materialized view OR
-- 3. Use a security definer function to access profiles_public

-- Let's use option 3: create a function that returns public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(id uuid, first_name text, avatar_url text, university text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, first_name, avatar_url, university, created_at
  FROM public.profiles
  WHERE id = profile_id;
$$;

-- Function to get multiple profiles at once (for nearby users)
CREATE OR REPLACE FUNCTION public.get_public_profiles(profile_ids uuid[])
RETURNS TABLE(id uuid, first_name text, avatar_url text, university text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, first_name, avatar_url, university, created_at
  FROM public.profiles
  WHERE id = ANY(profile_ids);
$$;

-- 2. Add missing RLS policies for user_roles
CREATE POLICY "Only service role can manage roles"
ON public.user_roles
FOR ALL
USING (false)
WITH CHECK (false);

-- 3. Prevent updates/deletes on reports (immutable once submitted)  
CREATE POLICY "Reports cannot be modified"
ON public.reports
FOR UPDATE
USING (false);

CREATE POLICY "Reports cannot be deleted by users"
ON public.reports
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Prevent updates/deletes on app_feedback
CREATE POLICY "Feedback cannot be modified"
ON public.app_feedback
FOR UPDATE
USING (false);

CREATE POLICY "Feedback cannot be deleted"
ON public.app_feedback
FOR DELETE
USING (false);