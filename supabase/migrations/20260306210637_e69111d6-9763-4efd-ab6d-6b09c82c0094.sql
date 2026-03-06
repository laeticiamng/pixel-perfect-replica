
-- Create signal_rate_limits table for tracking signal creation rate
CREATE TABLE public.signal_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.signal_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can insert own rate limit records
CREATE POLICY "Users can insert own signal rate limits"
  ON public.signal_rate_limits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view own rate limit records
CREATE POLICY "Users can view own signal rate limits"
  ON public.signal_rate_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No update/delete by users
CREATE POLICY "No update signal rate limits"
  ON public.signal_rate_limits
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No delete signal rate limits"
  ON public.signal_rate_limits
  FOR DELETE
  TO authenticated
  USING (false);

-- Index for fast lookups
CREATE INDEX idx_signal_rate_limits_user_created
  ON public.signal_rate_limits (user_id, created_at DESC);

-- RPC to check signal rate limit (max 10 per hour)
CREATE OR REPLACE FUNCTION public.check_signal_rate_limit(p_user_id uuid)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.signal_rate_limits
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN recent_count < 10;
END;
$$;

-- Cleanup function for old signal rate limit records (called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_signal_rate_limits()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.signal_rate_limits
  WHERE created_at < now() - interval '2 hours';
END;
$$;
