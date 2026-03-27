
-- SEC: Fix user_achievements - Remove user self-insert, restrict to service_role
-- This prevents users from granting themselves arbitrary achievements
DROP POLICY IF EXISTS "Users can unlock achievements" ON public.user_achievements;

CREATE POLICY "Service role can insert achievements"
ON public.user_achievements
FOR INSERT
TO service_role
WITH CHECK (true);

-- SEC: Fix user_stats - Remove user self-insert with arbitrary ratings, restrict to service_role
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;

CREATE POLICY "Service role can insert stats"
ON public.user_stats
FOR INSERT
TO service_role
WITH CHECK (true);

-- SEC: Fix monthly_session_usage - Remove user self-insert, restrict to service_role
-- This prevents users from manipulating their session quota
DROP POLICY IF EXISTS "Users can insert own usage" ON public.monthly_session_usage;

CREATE POLICY "Service role can insert usage"
ON public.monthly_session_usage
FOR INSERT
TO service_role
WITH CHECK (true);

-- Also allow service_role to update monthly_session_usage (for incrementing counters)
CREATE POLICY "Service role can update usage"
ON public.monthly_session_usage
FOR UPDATE
TO service_role
USING (true);
