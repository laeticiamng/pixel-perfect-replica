-- Grant SELECT permission on profiles_public to authenticated users
-- The view already exists with security_invoker=on, we just need to allow access
GRANT SELECT ON public.profiles_public TO authenticated;

-- Verify that anon users cannot access the view
REVOKE ALL ON public.profiles_public FROM anon;