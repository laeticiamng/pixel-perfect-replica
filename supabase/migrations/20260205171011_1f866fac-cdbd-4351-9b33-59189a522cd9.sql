-- Add explicit deny anonymous access policies for defense-in-depth

-- Profiles table: Explicitly deny anonymous SELECT access
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Emergency contacts table: Explicitly deny anonymous SELECT access  
CREATE POLICY "Deny anonymous access to emergency contacts"
ON public.emergency_contacts
FOR SELECT
USING (auth.uid() IS NOT NULL);