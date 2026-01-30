-- Create table for cron job execution history
CREATE TABLE public.cron_job_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
  result JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  triggered_by TEXT NOT NULL DEFAULT 'cron' CHECK (triggered_by IN ('cron', 'manual'))
);

-- Enable RLS
ALTER TABLE public.cron_job_executions ENABLE ROW LEVEL SECURITY;

-- Only admins can view execution history
CREATE POLICY "Admins can view cron executions" 
ON public.cron_job_executions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Only system can insert (via service role)
CREATE POLICY "System can insert executions" 
ON public.cron_job_executions 
FOR INSERT 
WITH CHECK (true);

-- Only system can update (via service role)
CREATE POLICY "System can update executions" 
ON public.cron_job_executions 
FOR UPDATE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_cron_job_executions_job_name ON public.cron_job_executions(job_name);
CREATE INDEX idx_cron_job_executions_started_at ON public.cron_job_executions(started_at DESC);

-- Cleanup old execution logs (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_cron_executions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM cron_job_executions 
  WHERE started_at < now() - interval '30 days';
END;
$$;