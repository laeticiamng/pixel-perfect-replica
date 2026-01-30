-- Function to cleanup reveal_logs older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_reveal_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM reveal_logs WHERE created_at < now() - interval '90 days';
END;
$$;

-- Grant execute permission to authenticated users (for manual trigger if needed)
GRANT EXECUTE ON FUNCTION public.cleanup_old_reveal_logs() TO authenticated;