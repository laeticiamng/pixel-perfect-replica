
-- SEC: Remove self-insert policy on user_reliability to prevent score manipulation
DROP POLICY IF EXISTS "Users can insert own reliability" ON public.user_reliability;

-- SEC: Only service_role can insert reliability records
CREATE POLICY "Service role can insert reliability"
ON public.user_reliability
FOR INSERT
TO service_role
WITH CHECK (true);
