-- Create rate limit table for edge functions if not exists
CREATE TABLE IF NOT EXISTS public.edge_function_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_edge_function_rate_limits_lookup 
ON public.edge_function_rate_limits (user_id, function_name, window_start);

-- Enable RLS
ALTER TABLE public.edge_function_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: only system can manage rate limits (via service role in edge functions)
CREATE POLICY "No direct access to rate limits"
  ON public.edge_function_rate_limits
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Function to check and increment rate limit
-- Returns true if request is allowed, false if rate limited
CREATE OR REPLACE FUNCTION public.check_edge_function_rate_limit(
  p_user_id uuid,
  p_function_name text,
  p_max_requests integer DEFAULT 10,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamp with time zone;
  v_current_count integer;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  
  -- Count requests in current window
  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM public.edge_function_rate_limits
  WHERE user_id = p_user_id
    AND function_name = p_function_name
    AND window_start >= v_window_start;
  
  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Insert new request record
  INSERT INTO public.edge_function_rate_limits (user_id, function_name, window_start)
  VALUES (p_user_id, p_function_name, now());
  
  RETURN true;
END;
$$;

-- Cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_edge_function_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.edge_function_rate_limits 
  WHERE window_start < now() - interval '1 hour';
END;
$$;