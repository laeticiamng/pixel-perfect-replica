-- Audit trigger for sensitive profile field changes
-- Invariant I5: every consequential action leaves an immutable trace.
--
-- Captures any UPDATE that touches is_premium, is_city_guide,
-- shadow_banned, shadow_banned_until, shadow_ban_reason, or
-- purchased_sessions. The trigger writes a row per changed field
-- to admin_audit_logs so post-hoc reconciliation is unambiguous.

CREATE OR REPLACE FUNCTION public.audit_sensitive_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_jwt_role text := COALESCE(
    current_setting('request.jwt.claim.role', true),
    ''
  );
  v_actor_label uuid;
BEGIN
  -- Use the authenticated user when available, otherwise fall back
  -- to the target profile id (for service_role / system-driven changes
  -- where auth.uid() is null). This keeps admin_id NOT NULL satisfied.
  v_actor_label := COALESCE(v_actor, NEW.id);

  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, metadata)
    VALUES (
      v_actor_label,
      'profile.is_premium.changed',
      'profile',
      NEW.id,
      jsonb_build_object(
        'old', OLD.is_premium,
        'new', NEW.is_premium,
        'jwt_role', v_jwt_role,
        'self_initiated', (v_actor IS NOT NULL AND v_actor = NEW.id)
      )
    );
  END IF;

  IF NEW.is_city_guide IS DISTINCT FROM OLD.is_city_guide THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, metadata)
    VALUES (
      v_actor_label,
      'profile.is_city_guide.changed',
      'profile',
      NEW.id,
      jsonb_build_object(
        'old', OLD.is_city_guide,
        'new', NEW.is_city_guide,
        'jwt_role', v_jwt_role
      )
    );
  END IF;

  IF NEW.shadow_banned IS DISTINCT FROM OLD.shadow_banned
     OR NEW.shadow_banned_until IS DISTINCT FROM OLD.shadow_banned_until
     OR NEW.shadow_ban_reason IS DISTINCT FROM OLD.shadow_ban_reason THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, metadata)
    VALUES (
      v_actor_label,
      'profile.shadow_ban.changed',
      'profile',
      NEW.id,
      jsonb_build_object(
        'old_banned', OLD.shadow_banned,
        'new_banned', NEW.shadow_banned,
        'old_until', OLD.shadow_banned_until,
        'new_until', NEW.shadow_banned_until,
        'old_reason', OLD.shadow_ban_reason,
        'new_reason', NEW.shadow_ban_reason,
        'jwt_role', v_jwt_role
      )
    );
  END IF;

  IF NEW.purchased_sessions IS DISTINCT FROM OLD.purchased_sessions THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, metadata)
    VALUES (
      v_actor_label,
      'profile.purchased_sessions.changed',
      'profile',
      NEW.id,
      jsonb_build_object(
        'old', OLD.purchased_sessions,
        'new', NEW.purchased_sessions,
        'delta', COALESCE(NEW.purchased_sessions, 0) - COALESCE(OLD.purchased_sessions, 0),
        'jwt_role', v_jwt_role
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_sensitive_profile_changes ON public.profiles;

CREATE TRIGGER trg_audit_sensitive_profile_changes
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (
  OLD.is_premium IS DISTINCT FROM NEW.is_premium
  OR OLD.is_city_guide IS DISTINCT FROM NEW.is_city_guide
  OR OLD.shadow_banned IS DISTINCT FROM NEW.shadow_banned
  OR OLD.shadow_banned_until IS DISTINCT FROM NEW.shadow_banned_until
  OR OLD.shadow_ban_reason IS DISTINCT FROM NEW.shadow_ban_reason
  OR OLD.purchased_sessions IS DISTINCT FROM NEW.purchased_sessions
)
EXECUTE FUNCTION public.audit_sensitive_profile_changes();