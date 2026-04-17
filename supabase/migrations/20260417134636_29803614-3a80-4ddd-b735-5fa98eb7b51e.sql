-- Harden has_role to prevent arbitrary UID probing.
-- Rule: a caller may only check roles for itself, UNLESS the caller
-- is an admin (legitimate moderation use case) or the service_role
-- (used by Edge Functions running with elevated privileges).
--
-- This closes the user_roles_probe_arbitrary_uid finding without
-- breaking existing call sites: every current caller passes either
-- auth.uid() (client) or runs under service_role (Edge Functions
-- using SUPABASE_SERVICE_ROLE_KEY).

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_jwt_role text := COALESCE(
    current_setting('request.jwt.claim.role', true),
    ''
  );
  v_caller_is_admin boolean := false;
BEGIN
  -- Service role bypass (Edge Functions, cron, internal jobs).
  IF v_jwt_role = 'service_role' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    );
  END IF;

  -- Unauthenticated callers cannot probe anything.
  IF v_caller IS NULL THEN
    RETURN false;
  END IF;

  -- Self-check is always allowed.
  IF v_caller = _user_id THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    );
  END IF;

  -- Cross-user check: only admins may probe other users' roles.
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_caller AND role = 'admin'
  ) INTO v_caller_is_admin;

  IF NOT v_caller_is_admin THEN
    -- Silently deny — do not leak whether the target has the role.
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Lock down execution: only authenticated users and service_role need it.
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;