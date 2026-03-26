
-- SEC: Replace permissive INSERT policy on analytics_events to require authentication
DROP POLICY IF EXISTS "Users can insert own analytics events" ON public.analytics_events;

CREATE POLICY "Authenticated users can insert own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
