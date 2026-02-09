-- ============================================================================
-- Migration: connections table + ephemeral messages (expires_at)
-- Nearvity v2.0.0 - Mutual matching & ephemeral messaging
-- ============================================================================

-- 1. Create connection_status enum
DO $$ BEGIN
  CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create connections table for mutual matching
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES active_signals(id) ON DELETE SET NULL,
  activity activity_type NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  initiated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicate connections between same users
  CONSTRAINT unique_connection UNIQUE (user_a, user_b),
  -- Ensure user_a < user_b for canonical ordering
  CONSTRAINT ordered_users CHECK (user_a < user_b)
);

-- Indexes for connections
CREATE INDEX IF NOT EXISTS idx_connections_user_a ON connections(user_a);
CREATE INDEX IF NOT EXISTS idx_connections_user_b ON connections(user_b);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_created ON connections(created_at DESC);

-- 3. Add expires_at to messages for ephemeral messaging (24h auto-delete)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Set default expires_at = created_at + 24 hours for new messages
-- Update existing messages to expire 24h after creation
UPDATE messages SET expires_at = created_at + INTERVAL '24 hours' WHERE expires_at IS NULL;

-- Set default for future messages
ALTER TABLE messages ALTER COLUMN expires_at SET DEFAULT NOW() + INTERVAL '24 hours';

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON messages(expires_at);

-- 4. RLS Policies for connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own connections
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can create connections they initiated
CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = initiated_by);

-- Users can update connections they're part of (accept/decline)
CREATE POLICY "Users can update own connections"
  ON connections FOR UPDATE
  USING (auth.uid() = user_a OR auth.uid() = user_b)
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can delete connections they're part of
CREATE POLICY "Users can delete own connections"
  ON connections FOR DELETE
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- 5. Enable Realtime on connections
ALTER PUBLICATION supabase_realtime ADD TABLE connections;

-- 6. Updated ephemeral message cleanup to use expires_at
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM messages
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  INSERT INTO cron_job_executions (job_name, status, triggered_by, result, completed_at, duration_ms)
  VALUES (
    'cleanup_expired_messages',
    'success',
    'system',
    jsonb_build_object('deleted_messages', deleted_count),
    NOW(),
    0
  );
END;
$$;

-- 7. Cleanup expired connections (older than 48h if still pending)
CREATE OR REPLACE FUNCTION cleanup_expired_connections()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE connections
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '48 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  INSERT INTO cron_job_executions (job_name, status, triggered_by, result, completed_at, duration_ms)
  VALUES (
    'cleanup_expired_connections',
    'success',
    'system',
    jsonb_build_object('expired_connections', deleted_count),
    NOW(),
    0
  );
END;
$$;

-- 8. Signal rate limiting table
CREATE TABLE IF NOT EXISTS signal_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signal_rate_limits_user ON signal_rate_limits(user_id, created_at DESC);

ALTER TABLE signal_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON signal_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits"
  ON signal_rate_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to check signal rate limit (max 10/hour)
CREATE OR REPLACE FUNCTION check_signal_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signal_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO signal_count
  FROM signal_rate_limits
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  RETURN signal_count < 10;
END;
$$;
