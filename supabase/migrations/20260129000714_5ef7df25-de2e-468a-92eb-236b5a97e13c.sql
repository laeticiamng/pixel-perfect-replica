-- Drop the unprotected public view that exposes active signals without RLS
DROP VIEW IF EXISTS public.active_signals_public;

-- Enable realtime for active_signals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_signals;