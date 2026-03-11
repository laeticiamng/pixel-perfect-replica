-- =============================================================================
-- Session purchase replay protection
-- Prevents the same Stripe checkout_session_id from being confirmed twice
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.session_purchase_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_session_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sessions_purchased integer NOT NULL CHECK (sessions_purchased > 0 AND sessions_purchased <= 10),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS: only service role can insert/read (edge function uses service role key)
ALTER TABLE public.session_purchase_log ENABLE ROW LEVEL SECURITY;

-- No public policies — only service_role can access this table
COMMENT ON TABLE public.session_purchase_log IS 'Idempotency log for session purchases — prevents replay attacks on confirm-session-purchase';
