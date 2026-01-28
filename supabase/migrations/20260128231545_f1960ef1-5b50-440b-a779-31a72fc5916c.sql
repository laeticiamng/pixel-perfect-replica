-- Drop the overly permissive nearby profiles policy
DROP POLICY IF EXISTS "Users can view nearby user profiles" ON public.profiles;

-- 2. Create a function to fuzz GPS coordinates (reduce precision to ~100m)
CREATE OR REPLACE FUNCTION public.fuzz_coordinates(lat numeric, lon numeric)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fuzzed_lat numeric;
  fuzzed_lon numeric;
BEGIN
  -- Round to 3 decimal places (approximately 100m precision)
  fuzzed_lat := ROUND(lat::numeric, 3);
  fuzzed_lon := ROUND(lon::numeric, 3);
  
  RETURN jsonb_build_object('lat', fuzzed_lat, 'lon', fuzzed_lon);
END;
$$;

-- 3. Add admin role table for moderation access
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Add admin access to reports for moderation
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 5. Add admin access to app_feedback
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.app_feedback;
CREATE POLICY "Admins can view all feedback"
ON public.app_feedback
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));