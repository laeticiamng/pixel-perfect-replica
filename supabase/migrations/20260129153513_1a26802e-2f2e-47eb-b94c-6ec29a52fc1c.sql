-- 1. Sécuriser la vue profiles_public avec RLS
-- La vue utilise security_invoker donc elle hérite des policies de la table de base

-- 2. Ajouter une politique RLS sur profiles pour permettre l'accès public limité aux profils
-- (nécessaire pour le fonctionnement de l'app car les utilisateurs doivent voir les profils des autres)
CREATE POLICY "Authenticated users can view public profile fields via view"
ON public.profiles FOR SELECT
USING (
  -- L'utilisateur peut voir son propre profil complet
  auth.uid() = id
  OR
  -- Ou voir les profils des utilisateurs ayant un signal actif (via la fonction sécurisée)
  EXISTS (
    SELECT 1 FROM public.active_signals
    WHERE active_signals.user_id = profiles.id
    AND active_signals.expires_at > now()
  )
);

-- 3. Créer une table pour le système de blocage utilisateur
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Policies pour les blocages
CREATE POLICY "Users can view their own blocks"
ON public.user_blocks FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
ON public.user_blocks FOR INSERT
WITH CHECK (auth.uid() = blocker_id AND auth.uid() != blocked_id);

CREATE POLICY "Users can remove their blocks"
ON public.user_blocks FOR DELETE
USING (auth.uid() = blocker_id);

-- 4. Créer une table pour les logs d'audit des actions admin
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir les logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Insertion via service role uniquement
CREATE POLICY "No direct insert to audit logs"
ON public.admin_audit_logs FOR INSERT
WITH CHECK (false);

-- 5. Ajouter contrainte de longueur sur bio (max 500 caractères)
ALTER TABLE public.profiles ADD CONSTRAINT bio_length_check CHECK (bio IS NULL OR length(bio) <= 500);

-- 6. Ajouter contrainte de longueur sur location_description
ALTER TABLE public.active_signals ADD CONSTRAINT location_description_length_check CHECK (location_description IS NULL OR length(location_description) <= 200);

-- 7. Créer un trigger pour alerter sur nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.notify_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Log the new user event
  INSERT INTO public.analytics_events (event_name, event_category, event_data, user_id)
  VALUES ('new_user_registered', 'auth', jsonb_build_object('email', NEW.email, 'first_name', NEW.first_name), NEW.id);
  
  RETURN NEW;
END;
$$;

-- Attach trigger to profiles table (fires after user creation via handle_new_user)
DROP TRIGGER IF EXISTS trigger_notify_new_user ON public.profiles;
CREATE TRIGGER trigger_notify_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user();

-- 8. Créer un trigger pour alerter sur signalements multiples
CREATE OR REPLACE FUNCTION public.check_high_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_count INTEGER;
BEGIN
  -- Count reports for this user in the last 24 hours
  SELECT COUNT(*) INTO report_count
  FROM public.reports
  WHERE reported_user_id = NEW.reported_user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- If 3+ reports in 24h, log a high_reports event
  IF report_count >= 3 THEN
    INSERT INTO public.analytics_events (event_name, event_category, event_data)
    VALUES ('high_reports_detected', 'security', jsonb_build_object(
      'reported_user_id', NEW.reported_user_id,
      'report_count', report_count
    ));
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_high_reports ON public.reports;
CREATE TRIGGER trigger_check_high_reports
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.check_high_reports();

-- 9. Mettre à jour la fonction get_nearby_signals pour exclure les utilisateurs bloqués
CREATE OR REPLACE FUNCTION public.get_nearby_signals(user_lat numeric, user_lon numeric, max_distance_meters integer DEFAULT 500)
RETURNS TABLE(id uuid, user_id uuid, signal_type signal_type, activity activity_type, latitude numeric, longitude numeric, started_at timestamp with time zone, first_name text, avatar_url text, rating numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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