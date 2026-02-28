
-- Ticket 1: RLS Hardening for connections table
-- 1. Unique constraint to prevent duplicate connections
ALTER TABLE public.connections ADD CONSTRAINT connections_user_a_user_b_unique UNIQUE (user_a, user_b);

-- 2. Composite index for fast lookups
CREATE INDEX IF NOT EXISTS idx_connections_user_a_user_b ON public.connections (user_a, user_b);

-- 3. Trigger to enforce canonical order (user_a < user_b)
CREATE OR REPLACE FUNCTION public.enforce_connection_canonical_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_a >= NEW.user_b THEN
    RAISE EXCEPTION 'user_a must be less than user_b (canonical order)';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_connections_canonical_order
  BEFORE INSERT OR UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_connection_canonical_order();
