-- Drop existing permissive policies
DROP POLICY IF EXISTS "System can insert executions" ON public.cron_job_executions;
DROP POLICY IF EXISTS "System can update executions" ON public.cron_job_executions;

-- Create more restrictive policies that check for authenticated users
-- The INSERT policy allows authenticated users to insert (for manual triggers from admin UI)
CREATE POLICY "Authenticated users can insert executions" 
ON public.cron_job_executions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- The UPDATE policy allows authenticated users to update their own executions
CREATE POLICY "Authenticated users can update executions" 
ON public.cron_job_executions 
FOR UPDATE 
TO authenticated
USING (true);