
-- Fix P0: Replace overly permissive SELECT on events that exposes qr_code_secret
-- Drop the policy that gives all authenticated users full SELECT including qr_code_secret
DROP POLICY IF EXISTS "Authenticated users can view active events" ON public.events;

-- Create a restrictive SELECT policy: organizers see everything, others use RPC functions
-- Non-organizer authenticated users should use get_events_public() or get_event_for_user() RPCs
-- This policy allows SELECT only for the organizer (who already has an ALL policy)
-- For public listing, the SECURITY DEFINER RPCs (get_events_public, get_event_for_user) bypass RLS
-- So removing this policy is safe since all read access goes through RPCs already
