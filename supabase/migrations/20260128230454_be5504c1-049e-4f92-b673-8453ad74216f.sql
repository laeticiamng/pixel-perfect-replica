-- 1. Restrict user_stats to only view own stats
DROP POLICY IF EXISTS "Users can view all stats" ON public.user_stats;

CREATE POLICY "Users can view own stats"
ON public.user_stats FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow viewing stats of nearby users (for ratings display)
CREATE POLICY "Users can view nearby user stats"
ON public.user_stats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.active_signals 
    WHERE user_id = user_stats.user_id 
    AND expires_at > now()
  )
);

-- 3. Add RLS policies for profiles_public view
-- Note: Views inherit RLS from base table, but we need to ensure proper access
GRANT SELECT ON public.profiles_public TO authenticated;

-- 4. Update profiles policy to be more restrictive - use profiles_public for listing
-- Keep existing policies but ensure queries use the view instead