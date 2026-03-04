
-- Group signals: let users create group meetups for 3+ people
CREATE TABLE public.group_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity activity_type NOT NULL,
  title text NOT NULL DEFAULT '',
  description text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  location_description text,
  max_participants integer NOT NULL DEFAULT 5 CHECK (max_participants >= 3 AND max_participants <= 20),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '3 hours'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'ended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Group signal members
CREATE TABLE public.group_signal_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_signal_id uuid NOT NULL REFERENCES public.group_signals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_signal_id, user_id)
);

-- Group signal messages (group chat)
CREATE TABLE public.group_signal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_signal_id uuid NOT NULL REFERENCES public.group_signals(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_group_signals_status ON public.group_signals(status) WHERE status = 'active';
CREATE INDEX idx_group_signals_expires ON public.group_signals(expires_at);
CREATE INDEX idx_group_signal_members_group ON public.group_signal_members(group_signal_id);
CREATE INDEX idx_group_signal_members_user ON public.group_signal_members(user_id);
CREATE INDEX idx_group_signal_messages_group ON public.group_signal_messages(group_signal_id);

-- Enable RLS
ALTER TABLE public.group_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_signal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_signal_messages ENABLE ROW LEVEL SECURITY;

-- RLS: group_signals
CREATE POLICY "Authenticated can view active group signals"
  ON public.group_signals FOR SELECT TO authenticated
  USING (status = 'active' AND expires_at > now());

CREATE POLICY "Creators can view own group signals"
  ON public.group_signals FOR SELECT TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Authenticated can create group signals"
  ON public.group_signals FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update own group signals"
  ON public.group_signals FOR UPDATE TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete own group signals"
  ON public.group_signals FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- RLS: group_signal_members
CREATE POLICY "Members and creators can view group members"
  ON public.group_signal_members FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.group_signal_members gsm WHERE gsm.group_signal_id = group_signal_members.group_signal_id AND gsm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.group_signals gs WHERE gs.id = group_signal_members.group_signal_id AND gs.creator_id = auth.uid())
  );

CREATE POLICY "Authenticated can join group signals"
  ON public.group_signal_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can leave group signals"
  ON public.group_signal_members FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- RLS: group_signal_messages
CREATE POLICY "Group members can view messages"
  ON public.group_signal_messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.group_signal_members gsm WHERE gsm.group_signal_id = group_signal_messages.group_signal_id AND gsm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.group_signals gs WHERE gs.id = group_signal_messages.group_signal_id AND gs.creator_id = auth.uid())
  );

CREATE POLICY "Group members can send messages"
  ON public.group_signal_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM public.group_signal_members gsm WHERE gsm.group_signal_id = group_signal_messages.group_signal_id AND gsm.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.group_signals gs WHERE gs.id = group_signal_messages.group_signal_id AND gs.creator_id = auth.uid())
    )
  );

-- Enable realtime for group chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_signal_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_signal_members;

-- RPC: Get nearby group signals
CREATE OR REPLACE FUNCTION public.get_nearby_group_signals(
  user_lat numeric,
  user_lon numeric,
  max_distance_meters integer DEFAULT 1000
)
RETURNS TABLE(
  id uuid,
  creator_id uuid,
  creator_name text,
  creator_avatar text,
  activity activity_type,
  title text,
  description text,
  latitude numeric,
  longitude numeric,
  location_description text,
  max_participants integer,
  current_members bigint,
  started_at timestamptz,
  expires_at timestamptz,
  status text,
  member_names text[],
  is_member boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT
    gs.id,
    gs.creator_id,
    p.first_name as creator_name,
    p.avatar_url as creator_avatar,
    gs.activity,
    gs.title,
    gs.description,
    ROUND(gs.latitude::numeric, 3) as latitude,
    ROUND(gs.longitude::numeric, 3) as longitude,
    gs.location_description,
    gs.max_participants,
    (SELECT COUNT(*) FROM group_signal_members gsm WHERE gsm.group_signal_id = gs.id) + 1 as current_members,
    gs.started_at,
    gs.expires_at,
    gs.status,
    ARRAY(
      SELECT pr.first_name FROM group_signal_members gm
      JOIN profiles pr ON pr.id = gm.user_id
      WHERE gm.group_signal_id = gs.id
      LIMIT 5
    ) as member_names,
    (
      gs.creator_id = auth.uid()
      OR EXISTS (SELECT 1 FROM group_signal_members gm WHERE gm.group_signal_id = gs.id AND gm.user_id = auth.uid())
    ) as is_member
  FROM group_signals gs
  JOIN profiles p ON p.id = gs.creator_id
  WHERE gs.status = 'active'
    AND gs.expires_at > now()
    AND (p.shadow_banned = false OR p.shadow_banned IS NULL)
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = gs.creator_id)
         OR (blocker_id = gs.creator_id AND blocked_id = auth.uid())
    )
    AND (
      6371000 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS(gs.latitude - user_lat) / 2), 2) +
        COS(RADIANS(user_lat)) * COS(RADIANS(gs.latitude)) *
        POWER(SIN(RADIANS(gs.longitude - user_lon) / 2), 2)
      )) <= max_distance_meters
    )
  ORDER BY
    (gs.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM group_signal_members gm WHERE gm.group_signal_id = gs.id AND gm.user_id = auth.uid())) DESC,
    gs.started_at DESC
  LIMIT 20;
$$;

-- RPC: Join a group signal
CREATE OR REPLACE FUNCTION public.join_group_signal(p_group_signal_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_max integer;
  v_current bigint;
  v_status text;
BEGIN
  SELECT max_participants, status INTO v_max, v_status
  FROM group_signals WHERE id = p_group_signal_id;

  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Group signal is not active';
  END IF;

  SELECT COUNT(*) + 1 INTO v_current
  FROM group_signal_members WHERE group_signal_id = p_group_signal_id;

  IF v_current >= v_max THEN
    RAISE EXCEPTION 'Group is full';
  END IF;

  INSERT INTO group_signal_members (group_signal_id, user_id)
  VALUES (p_group_signal_id, auth.uid());

  -- Auto-set to full if at capacity
  IF v_current + 1 >= v_max THEN
    UPDATE group_signals SET status = 'full' WHERE id = p_group_signal_id;
  END IF;

  RETURN true;
END;
$$;

-- RPC: Leave a group signal
CREATE OR REPLACE FUNCTION public.leave_group_signal(p_group_signal_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM group_signal_members
  WHERE group_signal_id = p_group_signal_id AND user_id = auth.uid();

  -- Re-open if was full
  UPDATE group_signals SET status = 'active'
  WHERE id = p_group_signal_id AND status = 'full';

  RETURN true;
END;
$$;
