-- Corriger le warning SECURITY DEFINER VIEW
-- On supprime la vue et on utilisera la fonction RPC existante get_events_public

DROP VIEW IF EXISTS public.events_public;