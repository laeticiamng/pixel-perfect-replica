
-- SEC: Explicitly deny INSERT on user_roles to prevent privilege escalation
CREATE POLICY "No direct insert to user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- SEC: Explicitly deny UPDATE on user_roles
CREATE POLICY "No direct update to user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);

-- SEC: Explicitly deny DELETE on user_roles
CREATE POLICY "No direct delete from user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- SEC: Restrict testimonials to authenticated users only (prevent UUID exposure)
DROP POLICY IF EXISTS "Everyone can view approved testimonials" ON public.user_testimonials;

CREATE POLICY "Authenticated can view approved testimonials"
ON public.user_testimonials
FOR SELECT
TO authenticated
USING (is_approved = true);
