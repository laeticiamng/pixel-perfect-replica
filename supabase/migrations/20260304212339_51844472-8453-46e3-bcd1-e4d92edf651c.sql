
-- Table to track when users last read each conversation
CREATE TABLE public.conversation_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  interaction_id uuid NOT NULL REFERENCES public.interactions(id) ON DELETE CASCADE,
  last_read_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, interaction_id)
);

-- Enable RLS
ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own reads
CREATE POLICY "Users can view own reads" ON public.conversation_reads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own reads" ON public.conversation_reads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reads" ON public.conversation_reads
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_conversation_reads_user ON public.conversation_reads(user_id);

-- RPC to get conversations with unread counts efficiently
CREATE OR REPLACE FUNCTION public.get_conversations_with_unread(p_user_id uuid)
RETURNS TABLE(
  interaction_id uuid,
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  last_message text,
  last_message_at timestamp with time zone,
  activity text,
  message_count bigint,
  unread_count bigint,
  icebreaker text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id as interaction_id,
    CASE WHEN i.user_id = p_user_id THEN i.target_user_id ELSE i.user_id END as other_user_id,
    COALESCE(p.first_name, 'User') as other_user_name,
    p.avatar_url as other_user_avatar,
    lm.content as last_message,
    COALESCE(lm.created_at, i.created_at) as last_message_at,
    i.activity::text,
    COALESCE(mc.cnt, 0) as message_count,
    COALESCE(uc.cnt, 0) as unread_count,
    i.icebreaker
  FROM interactions i
  JOIN profiles p ON p.id = (CASE WHEN i.user_id = p_user_id THEN i.target_user_id ELSE i.user_id END)
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM messages m
    WHERE m.interaction_id = i.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as cnt
    FROM messages m
    WHERE m.interaction_id = i.id
  ) mc ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as cnt
    FROM messages m
    LEFT JOIN conversation_reads cr ON cr.interaction_id = i.id AND cr.user_id = p_user_id
    WHERE m.interaction_id = i.id
      AND m.sender_id != p_user_id
      AND m.created_at > COALESCE(cr.last_read_at, '1970-01-01'::timestamptz)
  ) uc ON true
  WHERE (i.user_id = p_user_id OR i.target_user_id = p_user_id)
    AND (p.shadow_banned = false OR p.shadow_banned IS NULL)
  ORDER BY COALESCE(lm.created_at, i.created_at) DESC;
$$;

-- RPC to get total unread message count across all conversations
CREATE OR REPLACE FUNCTION public.get_total_unread_messages(p_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(unread), 0)::bigint
  FROM (
    SELECT COUNT(*) as unread
    FROM interactions i
    JOIN messages m ON m.interaction_id = i.id
    LEFT JOIN conversation_reads cr ON cr.interaction_id = i.id AND cr.user_id = p_user_id
    WHERE (i.user_id = p_user_id OR i.target_user_id = p_user_id)
      AND m.sender_id != p_user_id
      AND m.created_at > COALESCE(cr.last_read_at, '1970-01-01'::timestamptz)
  ) sub;
$$;
