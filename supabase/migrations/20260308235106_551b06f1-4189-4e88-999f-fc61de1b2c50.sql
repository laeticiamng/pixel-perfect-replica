-- Erasmus+ backend enhancements: events social layer, inclusion-prioritized matching, institutional metrics

-- 1) Events hub metadata (official vs community)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_source text NOT NULL DEFAULT 'community',
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_label text;

CREATE INDEX IF NOT EXISTS idx_events_source_starts_at
  ON public.events(event_source, starts_at DESC);

-- 2) Public events feed with source metadata + participant counts
DROP FUNCTION IF EXISTS public.get_events_public();

CREATE FUNCTION public.get_events_public()
RETURNS TABLE(
  id uuid,
  organizer_id uuid,
  name text,
  description text,
  location_name text,
  latitude numeric,
  longitude numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  max_participants integer,
  is_active boolean,
  created_at timestamptz,
  event_source text,
  source_url text,
  source_label text,
  participant_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id,
    e.organizer_id,
    e.name,
    e.description,
    e.location_name,
    e.latitude,
    e.longitude,
    e.starts_at,
    e.ends_at,
    e.max_participants,
    e.is_active,
    e.created_at,
    e.event_source,
    e.source_url,
    e.source_label,
    COALESCE(ep.participant_count, 0)::bigint AS participant_count
  FROM public.events e
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS participant_count
    FROM public.event_participants p
    WHERE p.event_id = e.id
  ) ep ON TRUE
  WHERE auth.uid() IS NOT NULL
    AND e.is_active = true
    AND e.ends_at > now()
  ORDER BY e.starts_at ASC;
$$;

-- 3) Public attendee list for "Who else is going?"
CREATE OR REPLACE FUNCTION public.get_event_attendees_public(
  p_event_id uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  user_id uuid,
  first_name text,
  avatar_url text,
  joined_at timestamptz,
  checked_in boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ep.user_id,
    p.first_name,
    p.avatar_url,
    ep.joined_at,
    ep.checked_in
  FROM public.event_participants ep
  JOIN public.profiles p ON p.id = ep.user_id
  LEFT JOIN public.user_settings us ON us.user_id = p.id
  JOIN public.events e ON e.id = ep.event_id
  WHERE auth.uid() IS NOT NULL
    AND ep.event_id = p_event_id
    AND e.is_active = true
    AND e.ends_at > now()
    AND (p.shadow_banned = false OR p.shadow_banned IS NULL)
    AND (us.ghost_mode IS NULL OR us.ghost_mode = false)
  ORDER BY ep.joined_at ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 200));
$$;

GRANT EXECUTE ON FUNCTION public.get_event_attendees_public(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_events_public() TO authenticated;

-- 4) Inclusion Radar prioritization in nearby matching
CREATE OR REPLACE FUNCTION public.get_nearby_signals(
  user_lat numeric,
  user_lon numeric,
  max_distance_meters integer DEFAULT 500
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  signal_type signal_type,
  activity activity_type,
  latitude numeric,
  longitude numeric,
  started_at timestamptz,
  first_name text,
  avatar_url text,
  rating numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT
      COALESCE(inclusion_international, false) AS inclusion_international,
      COALESCE(inclusion_disability, false) AS inclusion_disability,
      COALESCE(inclusion_lgbtq, false) AS inclusion_lgbtq,
      COALESCE(inclusion_first_gen, false) AS inclusion_first_gen
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  ),
  candidates AS (
    SELECT
      s.id,
      s.user_id,
      s.signal_type,
      s.activity,
      ROUND(s.latitude::numeric, 3) AS latitude,
      ROUND(s.longitude::numeric, 3) AS longitude,
      s.started_at,
      p.first_name,
      p.avatar_url,
      COALESCE(st.rating, 4.0) AS rating,
      (
        6371000 * 2 * ASIN(
          SQRT(
            POWER(SIN(RADIANS(s.latitude - user_lat) / 2), 2)
            + COS(RADIANS(user_lat)) * COS(RADIANS(s.latitude))
            * POWER(SIN(RADIANS(s.longitude - user_lon) / 2), 2)
          )
        )
      ) AS distance_m,
      (
        (CASE WHEN me.inclusion_international AND COALESCE(p.inclusion_international, false) THEN 1 ELSE 0 END)
        + (CASE WHEN me.inclusion_disability AND COALESCE(p.inclusion_disability, false) THEN 1 ELSE 0 END)
        + (CASE WHEN me.inclusion_lgbtq AND COALESCE(p.inclusion_lgbtq, false) THEN 1 ELSE 0 END)
        + (CASE WHEN me.inclusion_first_gen AND COALESCE(p.inclusion_first_gen, false) THEN 1 ELSE 0 END)
      ) AS inclusion_score
    FROM public.active_signals s
    JOIN public.profiles p ON p.id = s.user_id
    LEFT JOIN public.user_stats st ON st.user_id = s.user_id
    LEFT JOIN public.user_settings us ON us.user_id = s.user_id
    CROSS JOIN me
    WHERE auth.uid() IS NOT NULL
      AND s.expires_at > now()
      AND s.user_id <> auth.uid()
      AND (us.ghost_mode IS NULL OR us.ghost_mode = false)
      AND (p.shadow_banned = false OR p.shadow_banned IS NULL)
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_blocks ub
        WHERE (ub.blocker_id = auth.uid() AND ub.blocked_id = s.user_id)
           OR (ub.blocker_id = s.user_id AND ub.blocked_id = auth.uid())
      )
  )
  SELECT
    c.id,
    c.user_id,
    c.signal_type,
    c.activity,
    c.latitude,
    c.longitude,
    c.started_at,
    c.first_name,
    c.avatar_url,
    c.rating
  FROM candidates c
  WHERE c.distance_m <= max_distance_meters
  ORDER BY c.inclusion_score DESC, c.distance_m ASC, c.started_at DESC
  LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION public.get_nearby_signals(numeric, numeric, integer) TO authenticated;

-- 5) Inclusion Radar prioritization in Discover list
CREATE OR REPLACE FUNCTION public.discover_users(
  p_activity text DEFAULT NULL,
  p_university text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  user_id uuid,
  first_name text,
  avatar_url text,
  university text,
  favorite_activities text[],
  last_active_at timestamptz,
  is_online_now boolean,
  current_activity text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT
      COALESCE(inclusion_international, false) AS inclusion_international,
      COALESCE(inclusion_disability, false) AS inclusion_disability,
      COALESCE(inclusion_lgbtq, false) AS inclusion_lgbtq,
      COALESCE(inclusion_first_gen, false) AS inclusion_first_gen
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  ),
  base AS (
    SELECT
      p.id AS user_id,
      p.first_name,
      p.avatar_url,
      p.university,
      p.favorite_activities,
      COALESCE(last_sig.last_active, p.created_at) AS last_active_at,
      (active_now.user_id IS NOT NULL) AS is_online_now,
      active_now.activity::text AS current_activity,
      (
        (CASE WHEN me.inclusion_international AND COALESCE(p.inclusion_international, false) THEN 1 ELSE 0 END)
        + (CASE WHEN me.inclusion_disability AND COALESCE(p.inclusion_disability, false) THEN 1 ELSE 0 END)
        + (CASE WHEN me.inclusion_lgbtq AND COALESCE(p.inclusion_lgbtq, false) THEN 1 ELSE 0 END)
        + (CASE WHEN me.inclusion_first_gen AND COALESCE(p.inclusion_first_gen, false) THEN 1 ELSE 0 END)
      ) AS inclusion_score
    FROM public.profiles p
    LEFT JOIN LATERAL (
      SELECT MAX(s.started_at) AS last_active
      FROM public.active_signals s
      WHERE s.user_id = p.id
    ) last_sig ON TRUE
    LEFT JOIN LATERAL (
      SELECT s.user_id, s.activity
      FROM public.active_signals s
      WHERE s.user_id = p.id
        AND s.expires_at > now()
      LIMIT 1
    ) active_now ON TRUE
    LEFT JOIN public.user_settings us ON us.user_id = p.id
    CROSS JOIN me
    WHERE auth.uid() IS NOT NULL
      AND p.id <> auth.uid()
      AND (p.shadow_banned = false OR p.shadow_banned IS NULL)
      AND (us.ghost_mode IS NULL OR us.ghost_mode = false)
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_blocks ub
        WHERE (ub.blocker_id = auth.uid() AND ub.blocked_id = p.id)
           OR (ub.blocker_id = p.id AND ub.blocked_id = auth.uid())
      )
      AND (
        p_activity IS NULL
        OR p_activity = ANY(p.favorite_activities)
        OR active_now.activity::text = p_activity
      )
      AND (p_university IS NULL OR p.university = p_university)
      AND (p_search IS NULL OR p.first_name ILIKE '%' || p_search || '%')
  )
  SELECT
    b.user_id,
    b.first_name,
    b.avatar_url,
    b.university,
    b.favorite_activities,
    b.last_active_at,
    b.is_online_now,
    b.current_activity
  FROM base b
  ORDER BY b.inclusion_score DESC, b.is_online_now DESC, b.last_active_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 30), 100));
$$;

GRANT EXECUTE ON FUNCTION public.discover_users(text, text, text, integer) TO authenticated;

-- 6) Institutional anonymized metrics dashboard
CREATE OR REPLACE FUNCTION public.get_institutional_metrics()
RETURNS TABLE(
  university text,
  students_total integer,
  isolated_pct numeric,
  avg_integration_days numeric,
  international_local_ratio numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH admin_guard AS (
    SELECT public.has_role(auth.uid(), 'admin') AS is_admin
  ),
  students AS (
    SELECT p.id, p.university, p.created_at
    FROM public.profiles p, admin_guard g
    WHERE g.is_admin = true
      AND p.university IS NOT NULL
      AND p.university <> ''
      AND (p.shadow_banned = false OR p.shadow_banned IS NULL)
  ),
  accepted_connections AS (
    SELECT c.user_a, c.user_b, COALESCE(c.accepted_at, c.created_at) AS accepted_at
    FROM public.connections c
    WHERE c.status = 'accepted' OR c.accepted_at IS NOT NULL
  ),
  student_links AS (
    SELECT s.university, s.id AS student_id, ac.accepted_at,
      CASE WHEN ac.user_a = s.id THEN ac.user_b ELSE ac.user_a END AS other_user_id
    FROM students s
    JOIN accepted_connections ac
      ON ac.user_a = s.id OR ac.user_b = s.id
  ),
  per_student AS (
    SELECT
      s.university,
      s.id AS student_id,
      COUNT(sl.other_user_id) AS links_count,
      MIN(sl.accepted_at) AS first_link_at,
      s.created_at
    FROM students s
    LEFT JOIN student_links sl
      ON sl.student_id = s.id
    GROUP BY s.university, s.id, s.created_at
  ),
  uni_base AS (
    SELECT
      university,
      COUNT(*)::int AS students_total,
      ROUND(100.0 * AVG(CASE WHEN links_count = 0 THEN 1.0 ELSE 0.0 END), 2) AS isolated_pct,
      ROUND(
        AVG(
          CASE
            WHEN first_link_at IS NULL THEN NULL
            ELSE EXTRACT(EPOCH FROM (first_link_at - created_at)) / 86400.0
          END
        )::numeric,
        2
      ) AS avg_integration_days
    FROM per_student
    GROUP BY university
    HAVING COUNT(*) >= 10
  ),
  uni_ratios AS (
    SELECT
      sl.university,
      SUM(CASE WHEN COALESCE(p_other.inclusion_international, false) THEN 1 ELSE 0 END)::numeric AS intl_links,
      SUM(CASE WHEN NOT COALESCE(p_other.inclusion_international, false) THEN 1 ELSE 0 END)::numeric AS local_links
    FROM student_links sl
    LEFT JOIN public.profiles p_other ON p_other.id = sl.other_user_id
    GROUP BY sl.university
  )
  SELECT
    ub.university,
    ub.students_total,
    ub.isolated_pct,
    ub.avg_integration_days,
    ROUND(COALESCE(ur.intl_links / NULLIF(ur.local_links, 0), 0), 2) AS international_local_ratio
  FROM uni_base ub
  LEFT JOIN uni_ratios ur ON ur.university = ub.university
  ORDER BY ub.students_total DESC, ub.university ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_institutional_metrics() TO authenticated;