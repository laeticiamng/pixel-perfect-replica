
-- Add Erasmus newcomer fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_newcomer boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS arrival_city text,
  ADD COLUMN IF NOT EXISTS arrival_date date,
  ADD COLUMN IF NOT EXISTS is_city_guide boolean NOT NULL DEFAULT false;

-- Create newcomer checklist progress table
CREATE TABLE public.newcomer_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_key text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  location_name text,
  location_lat numeric,
  location_lng numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_key)
);

ALTER TABLE public.newcomer_checklist ENABLE ROW LEVEL SECURITY;

-- Users can manage their own checklist
CREATE POLICY "Users can view own checklist"
  ON public.newcomer_checklist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist"
  ON public.newcomer_checklist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist"
  ON public.newcomer_checklist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist"
  ON public.newcomer_checklist FOR DELETE
  USING (auth.uid() = user_id);

-- RPC to find city guides in the same university/city
CREATE OR REPLACE FUNCTION public.get_city_guides(p_city text, p_limit int DEFAULT 5)
RETURNS TABLE(
  user_id uuid,
  first_name text,
  avatar_url text,
  university text,
  bio text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id as user_id, p.first_name, p.avatar_url, p.university, p.bio
  FROM profiles p
  LEFT JOIN user_settings us ON us.user_id = p.id
  WHERE p.is_city_guide = true
    AND p.shadow_banned = false
    AND (p.arrival_city ILIKE p_city OR p.university ILIKE '%' || p_city || '%')
    AND (us.ghost_mode IS NULL OR us.ghost_mode = false)
    AND p.id != auth.uid()
  ORDER BY random()
  LIMIT p_limit;
$$;
