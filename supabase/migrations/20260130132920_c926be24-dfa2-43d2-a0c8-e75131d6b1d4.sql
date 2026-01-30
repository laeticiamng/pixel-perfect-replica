-- ============================================================
-- P1: Shadow-ban automatique pour utilisateurs signalés 3+ fois en 24h
-- ============================================================

-- Ajouter colonne shadow_banned sur profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shadow_banned boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shadow_banned_until timestamp with time zone;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shadow_ban_reason text;

-- Table pour tracker les révélations de profil (anti-stalking)
CREATE TABLE IF NOT EXISTS public.reveal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  revealed_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index pour performance des requêtes de rate limit
CREATE INDEX IF NOT EXISTS idx_reveal_logs_user_created 
ON public.reveal_logs(user_id, created_at DESC);

-- Index pour requêtes de reports récents
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_created 
ON public.reports(reported_user_id, created_at DESC);

-- RLS pour reveal_logs
ALTER TABLE public.reveal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reveal logs"
ON public.reveal_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reveal logs"
ON public.reveal_logs FOR SELECT
USING (auth.uid() = user_id);

-- Fonction pour vérifier le rate limit des reveals (max 10/heure)
CREATE OR REPLACE FUNCTION public.check_reveal_rate_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Max 10 reveals par heure
  SELECT COUNT(*) INTO recent_count
  FROM reveal_logs
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN recent_count < 10;
END;
$$;

-- Fonction pour log une révélation
CREATE OR REPLACE FUNCTION public.log_reveal(p_revealed_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed boolean;
BEGIN
  -- Vérifier le rate limit
  SELECT check_reveal_rate_limit(auth.uid()) INTO v_allowed;
  
  IF NOT v_allowed THEN
    RETURN false;
  END IF;
  
  -- Log la révélation
  INSERT INTO reveal_logs (user_id, revealed_user_id)
  VALUES (auth.uid(), p_revealed_user_id);
  
  RETURN true;
END;
$$;

-- Fonction pour vérifier et appliquer shadow-ban (appelée par trigger)
CREATE OR REPLACE FUNCTION public.check_and_apply_shadow_ban()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_count INTEGER;
BEGIN
  -- Compter les signalements des dernières 24h pour cet utilisateur
  SELECT COUNT(*) INTO report_count
  FROM public.reports
  WHERE reported_user_id = NEW.reported_user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Si 3+ signalements en 24h, appliquer shadow-ban automatique
  IF report_count >= 3 THEN
    UPDATE public.profiles
    SET 
      shadow_banned = true,
      shadow_banned_until = NOW() + INTERVAL '24 hours',
      shadow_ban_reason = 'Auto: 3+ signalements en 24h'
    WHERE id = NEW.reported_user_id
      AND shadow_banned = false;
    
    -- Log l'événement
    INSERT INTO public.analytics_events (event_name, event_category, event_data)
    VALUES (
      'shadow_ban_applied', 
      'security', 
      jsonb_build_object(
        'user_id', NEW.reported_user_id,
        'report_count', report_count,
        'auto_applied', true
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour vérifier shadow-ban après chaque signalement
DROP TRIGGER IF EXISTS check_shadow_ban_on_report ON public.reports;
CREATE TRIGGER check_shadow_ban_on_report
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.check_and_apply_shadow_ban();

-- Fonction pour lever le shadow-ban expiré
CREATE OR REPLACE FUNCTION public.cleanup_expired_shadow_bans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    shadow_banned = false,
    shadow_banned_until = NULL,
    shadow_ban_reason = NULL
  WHERE shadow_banned = true
    AND shadow_banned_until IS NOT NULL
    AND shadow_banned_until < NOW();
END;
$$;

-- Mettre à jour get_nearby_signals pour exclure les shadow-banned
CREATE OR REPLACE FUNCTION public.get_nearby_signals(user_lat numeric, user_lon numeric, max_distance_meters integer DEFAULT 500)
 RETURNS TABLE(id uuid, user_id uuid, signal_type signal_type, activity activity_type, latitude numeric, longitude numeric, started_at timestamp with time zone, first_name text, avatar_url text, rating numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    s.id,
    s.user_id,
    s.signal_type,
    s.activity,
    ROUND(s.latitude::numeric, 3) as latitude,
    ROUND(s.longitude::numeric, 3) as longitude,
    s.started_at,
    p.first_name,
    p.avatar_url,
    COALESCE(st.rating, 4.0) as rating
  FROM public.active_signals s
  JOIN public.profiles p ON p.id = s.user_id
  LEFT JOIN public.user_stats st ON st.user_id = s.user_id
  LEFT JOIN public.user_settings us ON us.user_id = s.user_id
  WHERE s.expires_at > now()
    AND s.user_id != auth.uid()
    AND (us.ghost_mode IS NULL OR us.ghost_mode = false)
    -- Exclure les utilisateurs shadow-banned
    AND (p.shadow_banned = false OR p.shadow_banned IS NULL)
    -- Exclure les utilisateurs bloqués (dans les deux sens)
    AND NOT EXISTS (
      SELECT 1 FROM public.user_blocks 
      WHERE (blocker_id = auth.uid() AND blocked_id = s.user_id)
         OR (blocker_id = s.user_id AND blocked_id = auth.uid())
    )
    AND (
      6371000 * 2 * ASIN(
        SQRT(
          POWER(SIN(RADIANS(s.latitude - user_lat) / 2), 2) +
          COS(RADIANS(user_lat)) * COS(RADIANS(s.latitude)) *
          POWER(SIN(RADIANS(s.longitude - user_lon) / 2), 2)
        )
      ) <= max_distance_meters
    )
  ORDER BY s.started_at DESC
  LIMIT 50;
$$;