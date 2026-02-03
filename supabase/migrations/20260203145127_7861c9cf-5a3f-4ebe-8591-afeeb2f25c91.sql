-- =====================================================
-- CORRECTION SECURITÉ: Renforcement RLS
-- =====================================================

-- 1. S'assurer que events.qr_code_secret n'est PAS exposé aux participants
-- La fonction get_event_for_user gère déjà ça avec CASE, mais renforçons

-- 2. Ajouter des politiques de refus explicites pour les tables sensibles (déjà en place via les policies existantes)

-- 3. Créer une vue sécurisée pour les événements sans exposer qr_code_secret
CREATE OR REPLACE VIEW public.events_public AS
SELECT 
  id, organizer_id, name, description, location_name,
  latitude, longitude, starts_at, ends_at,
  max_participants, is_active, created_at
FROM public.events
WHERE is_active = true AND ends_at > now();

-- 4. Ajouter rate limiting amélioré pour les révélations de profils
-- (éviter le tracking de masse)
CREATE OR REPLACE FUNCTION public.check_reveal_rate_limit_strict(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
  daily_count integer;
BEGIN
  -- Max 10 reveals par heure
  SELECT COUNT(*) INTO recent_count
  FROM reveal_logs
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Max 50 reveals par jour
  SELECT COUNT(*) INTO daily_count
  FROM reveal_logs
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF recent_count >= 10 OR daily_count >= 50 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 5. Ajouter une fonction pour vérifier les blocages bidirectionnels (déjà dans get_nearby_signals)
-- On confirme l'existence de la fonction check_user_blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(p_user_id uuid, p_target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks 
    WHERE (blocker_id = p_user_id AND blocked_id = p_target_id)
       OR (blocker_id = p_target_id AND blocked_id = p_user_id)
  )
$$;

-- 6. Améliorer la protection des données de feedback
-- Empêcher les utilisateurs signalés de voir qui les a signalés
-- (déjà en place via RLS sur reports)

-- 7. Ajouter un index pour améliorer les performances des requêtes de sécurité
CREATE INDEX IF NOT EXISTS idx_reveal_logs_user_created 
ON public.reveal_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_blocks_bidirectional 
ON public.user_blocks(blocker_id, blocked_id);

-- 8. Trigger pour nettoyer automatiquement les coordonnées des interactions après 30 jours
-- (déjà géré par la fonction cleanup_old_interaction_locations appelée par cron)