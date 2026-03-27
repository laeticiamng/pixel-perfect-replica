
-- SEC: Fix profiles UPDATE policy - Add is_city_guide to protected fields
-- Prevents users from self-assigning city guide status
DROP POLICY IF EXISTS "Users can update own profile safe fields" ON public.profiles;

CREATE POLICY "Users can update own profile safe fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  (auth.uid() = id)
  AND (NOT (is_premium IS DISTINCT FROM (SELECT profiles_1.is_premium FROM profiles profiles_1 WHERE profiles_1.id = auth.uid())))
  AND (NOT (shadow_banned IS DISTINCT FROM (SELECT profiles_1.shadow_banned FROM profiles profiles_1 WHERE profiles_1.id = auth.uid())))
  AND (NOT (shadow_banned_until IS DISTINCT FROM (SELECT profiles_1.shadow_banned_until FROM profiles profiles_1 WHERE profiles_1.id = auth.uid())))
  AND (NOT (shadow_ban_reason IS DISTINCT FROM (SELECT profiles_1.shadow_ban_reason FROM profiles profiles_1 WHERE profiles_1.id = auth.uid())))
  AND (NOT (purchased_sessions IS DISTINCT FROM (SELECT profiles_1.purchased_sessions FROM profiles profiles_1 WHERE profiles_1.id = auth.uid())))
  AND (NOT (is_city_guide IS DISTINCT FROM (SELECT profiles_1.is_city_guide FROM profiles profiles_1 WHERE profiles_1.id = auth.uid())))
);

-- SEC: Fix connections UPDATE policy - Prevent self-accepting connection requests
-- Only the non-initiating party can accept; initiator cannot force acceptance
DROP POLICY IF EXISTS "Users can update own connections" ON public.connections;

CREATE POLICY "Users can update own connections"
ON public.connections
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_a) OR (auth.uid() = user_b))
WITH CHECK (
  ((auth.uid() = user_a) OR (auth.uid() = user_b))
  AND (NOT (initiated_by IS DISTINCT FROM (SELECT c.initiated_by FROM connections c WHERE c.id = connections.id)))
  AND (
    CASE 
      WHEN status = 'accepted' THEN auth.uid() != initiated_by
      ELSE true
    END
  )
);
