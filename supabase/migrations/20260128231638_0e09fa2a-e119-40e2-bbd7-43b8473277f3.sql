-- Remove the overly permissive policy that exposes emails
DROP POLICY IF EXISTS "Authenticated can view public profile fields" ON public.profiles;