
-- Streaks table: tracks daily activity and consecutive streaks
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  week_activity jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_active_days integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Achievements table: stores unlocked achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

CREATE INDEX idx_user_streaks_user ON public.user_streaks(user_id);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Streaks RLS
CREATE POLICY "Users can view own streaks"
  ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own streaks"
  ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks"
  ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Achievements RLS
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock achievements"
  ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard RPC: returns top users by a composite score (interactions + streak + sessions)
CREATE OR REPLACE FUNCTION public.get_campus_leaderboard(p_university text DEFAULT NULL, p_limit integer DEFAULT 20)
RETURNS TABLE(
  user_id uuid,
  first_name text,
  avatar_url text,
  university text,
  interactions integer,
  current_streak integer,
  sessions_completed integer,
  score bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    p.id as user_id,
    p.first_name,
    p.avatar_url,
    p.university,
    COALESCE(us.interactions, 0) as interactions,
    COALESCE(str.current_streak, 0) as current_streak,
    COALESCE(ur.sessions_completed, 0) as sessions_completed,
    (COALESCE(us.interactions, 0) * 2 + COALESCE(str.current_streak, 0) * 5 + COALESCE(ur.sessions_completed, 0) * 10)::bigint as score
  FROM profiles p
  LEFT JOIN user_stats us ON us.user_id = p.id
  LEFT JOIN user_streaks str ON str.user_id = p.id
  LEFT JOIN user_reliability ur ON ur.user_id = p.id
  WHERE (p.shadow_banned = false OR p.shadow_banned IS NULL)
    AND (p_university IS NULL OR p.university = p_university)
  ORDER BY score DESC
  LIMIT p_limit;
$$;

-- Record daily activity RPC
CREATE OR REPLACE FUNCTION public.record_daily_activity(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_record user_streaks%ROWTYPE;
  v_new_streak integer;
  v_day_of_week integer;
  v_week_arr jsonb;
BEGIN
  SELECT * INTO v_record FROM user_streaks WHERE user_id = p_user_id;

  IF v_record IS NULL THEN
    -- First time: create record
    v_day_of_week := EXTRACT(ISODOW FROM v_today)::integer; -- 1=Mon, 7=Sun
    v_week_arr := '[]'::jsonb;
    -- Build week array with today marked
    FOR i IN 1..7 LOOP
      v_week_arr := v_week_arr || to_jsonb(i = v_day_of_week);
    END LOOP;

    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date, week_activity, total_active_days)
    VALUES (p_user_id, 1, 1, v_today, v_week_arr, 1);

    RETURN jsonb_build_object('current_streak', 1, 'longest_streak', 1, 'is_new_day', true);
  END IF;

  -- Already active today
  IF v_record.last_active_date = v_today THEN
    RETURN jsonb_build_object('current_streak', v_record.current_streak, 'longest_streak', v_record.longest_streak, 'is_new_day', false);
  END IF;

  -- Calculate new streak
  IF v_record.last_active_date = v_today - 1 THEN
    v_new_streak := v_record.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  -- Update week activity array
  v_day_of_week := EXTRACT(ISODOW FROM v_today)::integer;
  -- Reset week on Monday
  IF v_day_of_week = 1 THEN
    v_week_arr := '[true, false, false, false, false, false, false]'::jsonb;
  ELSE
    v_week_arr := v_record.week_activity;
    v_week_arr := jsonb_set(v_week_arr, ARRAY[(v_day_of_week - 1)::text], 'true'::jsonb);
  END IF;

  UPDATE user_streaks
  SET current_streak = v_new_streak,
      longest_streak = GREATEST(v_record.longest_streak, v_new_streak),
      last_active_date = v_today,
      week_activity = v_week_arr,
      total_active_days = v_record.total_active_days + 1,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('current_streak', v_new_streak, 'longest_streak', GREATEST(v_record.longest_streak, v_new_streak), 'is_new_day', true);
END;
$$;
