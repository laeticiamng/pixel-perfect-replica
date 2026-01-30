-- Function to cleanup analytics_events older than 90 days (GDPR compliance)
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_events()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM analytics_events WHERE created_at < now() - interval '90 days';
END;
$$;

-- Grant execute permission to authenticated users (for manual trigger if needed)
GRANT EXECUTE ON FUNCTION public.cleanup_old_analytics_events() TO authenticated;