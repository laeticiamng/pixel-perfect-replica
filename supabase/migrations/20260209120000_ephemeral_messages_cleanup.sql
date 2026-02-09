-- Ephemeral messages: automatically delete messages older than 24 hours
-- This ensures user privacy and GDPR compliance

-- Function to clean up old messages (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log cleanup execution
  INSERT INTO cron_job_executions (job_name, status, triggered_by, result, completed_at, duration_ms)
  VALUES (
    'cleanup_old_messages',
    'success',
    'system',
    jsonb_build_object('deleted_messages', deleted_count),
    NOW(),
    0
  );
END;
$$;

-- Also clean session messages older than 7 days
CREATE OR REPLACE FUNCTION cleanup_old_session_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM session_messages
  WHERE created_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  INSERT INTO cron_job_executions (job_name, status, triggered_by, result, completed_at, duration_ms)
  VALUES (
    'cleanup_old_session_messages',
    'success',
    'system',
    jsonb_build_object('deleted_session_messages', deleted_count),
    NOW(),
    0
  );
END;
$$;
