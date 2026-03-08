
-- P0 FIX: Restrict profiles UPDATE to safe columns only
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile safe fields"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND is_premium IS NOT DISTINCT FROM (SELECT is_premium FROM public.profiles WHERE id = auth.uid())
  AND shadow_banned IS NOT DISTINCT FROM (SELECT shadow_banned FROM public.profiles WHERE id = auth.uid())
  AND shadow_banned_until IS NOT DISTINCT FROM (SELECT shadow_banned_until FROM public.profiles WHERE id = auth.uid())
  AND shadow_ban_reason IS NOT DISTINCT FROM (SELECT shadow_ban_reason FROM public.profiles WHERE id = auth.uid())
  AND purchased_sessions IS NOT DISTINCT FROM (SELECT purchased_sessions FROM public.profiles WHERE id = auth.uid())
);

-- P1 FIX: Remove user UPDATE on monthly_session_usage
DROP POLICY IF EXISTS "Users can update own usage" ON public.monthly_session_usage;

-- P1 FIX: Remove user INSERT on user_achievements, use RPC instead
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;

-- P1 FIX: Remove user UPDATE on user_streaks
DROP POLICY IF EXISTS "Users can update own streaks" ON public.user_streaks;
