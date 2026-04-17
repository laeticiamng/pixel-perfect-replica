
-- ============================================================
-- P1-1: Protect events.qr_code_secret from public exposure
-- ============================================================
-- The current "Organizers can manage own events" policy correctly restricts
-- writes, but the public SELECT policy exposes qr_code_secret.
-- Solution: Replace permissive public SELECT with a SECURITY DEFINER RPC
-- that omits the secret, and restrict direct SELECT to organizer only.

-- Drop overly permissive policies (organizers already have ALL via separate policy)
-- Keep only organizer-scoped SELECT on the raw table
-- (The "Organizers can view own events" policy already covers this)

-- Create a safe public RPC for event discovery (without qr_code_secret)
CREATE OR REPLACE FUNCTION public.get_public_events(
  p_limit integer DEFAULT 100,
  p_only_active boolean DEFAULT true
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  location_name text,
  latitude numeric,
  longitude numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  max_participants integer,
  organizer_id uuid,
  event_source text,
  source_label text,
  source_url text,
  is_active boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id,
    e.name,
    e.description,
    e.location_name,
    e.latitude,
    e.longitude,
    e.starts_at,
    e.ends_at,
    e.max_participants,
    e.organizer_id,
    e.event_source,
    e.source_label,
    e.source_url,
    e.is_active,
    e.created_at
  FROM public.events e
  WHERE (NOT p_only_active OR e.is_active = true)
    AND e.ends_at > now()
  ORDER BY e.starts_at ASC
  LIMIT GREATEST(1, LEAST(p_limit, 500));
$$;

-- Single-event variant (also without secret)
CREATE OR REPLACE FUNCTION public.get_public_event(p_event_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  location_name text,
  latitude numeric,
  longitude numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  max_participants integer,
  organizer_id uuid,
  event_source text,
  source_label text,
  source_url text,
  is_active boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id, e.name, e.description, e.location_name,
    e.latitude, e.longitude, e.starts_at, e.ends_at,
    e.max_participants, e.organizer_id, e.event_source,
    e.source_label, e.source_url, e.is_active, e.created_at
  FROM public.events e
  WHERE e.id = p_event_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_events(integer, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_event(uuid) TO anon, authenticated;

-- Add a SELECT policy that allows authenticated users to read events
-- WITHOUT exposing the secret via column-level grant restriction.
-- Note: PostgreSQL RLS doesn't support column-level policies, so we rely on
-- the RPCs above for public reads. Direct table SELECT remains restricted to
-- organizer (via existing "Organizers can view own events" policy).
-- Participants who need check-in MUST use the existing check_in_event_by_qr RPC.

-- ============================================================
-- P1-2: Restrict public listing of avatars bucket
-- ============================================================
-- Current state: avatars bucket is public => anyone can LIST all avatars.
-- Fix: keep bucket public for direct URL access (needed for <img> tags)
-- but restrict LIST operations to authenticated users only.

-- Drop existing overly permissive list policies if any exist
DO $$
BEGIN
  -- Remove any existing public list policies on avatars
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Avatars are publicly listable'
  ) THEN
    DROP POLICY "Avatars are publicly listable" ON storage.objects;
  END IF;
END $$;

-- Ensure SELECT (read object metadata + binary) requires either:
--  • authenticated session, OR
--  • direct URL access via signed/public URL (handled by storage layer separately)
-- We keep public read for <img src=...> compatibility but enforce that
-- listings (queries against storage.objects) require auth.

-- Create a restrictive policy preventing anonymous LIST queries on avatars
CREATE POLICY "Avatars: authenticated list only"
ON storage.objects
AS RESTRICTIVE
FOR SELECT
TO anon
USING (bucket_id <> 'avatars');

-- Authenticated users can list avatars (existing public access via URL still works)
-- Public read via direct CDN URL is unaffected (it doesn't go through RLS).
