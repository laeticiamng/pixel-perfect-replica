-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert executions" ON public.cron_job_executions;
DROP POLICY IF EXISTS "Authenticated users can update executions" ON public.cron_job_executions;

-- Create admin-only policies (uses has_role function)
CREATE POLICY "Admins can insert cron executions" 
ON public.cron_job_executions 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cron executions" 
ON public.cron_job_executions 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));