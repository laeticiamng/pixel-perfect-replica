-- ============================================
-- AUDIT SECURITY FIX - Février 2026
-- ============================================

-- 1. CRITICAL: Restreindre l'accès aux profils - auth.uid() = id seulement
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles for interactions" ON profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. CRITICAL: Emergency contacts - strictement privés
DROP POLICY IF EXISTS "Users can view own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Deny anonymous access to emergency contacts" ON emergency_contacts;

CREATE POLICY "Users can view own emergency contacts"
  ON emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

-- 3. User stats - restreindre à son propre compte
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Authenticated users can view nearby user stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats safely" ON user_stats;

CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Bloquer les updates directs (seulement via fonctions RPC)
CREATE POLICY "Block direct stats updates"
  ON user_stats FOR UPDATE
  USING (false);

-- 4. User reliability - fonction sécurisée pour accès limité
DROP POLICY IF EXISTS "Users can view relevant reliability scores" ON user_reliability;
DROP POLICY IF EXISTS "Users can view own reliability" ON user_reliability;

CREATE POLICY "Users can view own reliability"
  ON user_reliability FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Créer une fonction sécurisée pour voir la fiabilité des autres (score seulement)
CREATE OR REPLACE FUNCTION public.get_user_reliability_public(p_user_id uuid)
RETURNS TABLE(user_id uuid, reliability_score numeric, sessions_completed integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ur.user_id,
    ur.reliability_score,
    ur.sessions_completed
  FROM public.user_reliability ur
  WHERE ur.user_id = p_user_id;
$$;

-- 6. Fonction sécurisée pour profils publics (champs limités)
CREATE OR REPLACE FUNCTION public.get_profile_for_display(p_user_id uuid)
RETURNS TABLE(id uuid, first_name text, avatar_url text, university text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.avatar_url,
    p.university
  FROM public.profiles p
  WHERE p.id = p_user_id
    AND (p.shadow_banned = false OR p.shadow_banned IS NULL);
$$;

-- 7. Admin alert preferences - strictement privé
DROP POLICY IF EXISTS "Users can manage own preferences" ON admin_alert_preferences;
DROP POLICY IF EXISTS "Users can view own admin preferences" ON admin_alert_preferences;

CREATE POLICY "Users can view own admin preferences"
  ON admin_alert_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own admin preferences"
  ON admin_alert_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Session participants - masquer les champs système
CREATE OR REPLACE FUNCTION public.get_session_participants_public(p_session_id uuid)
RETURNS TABLE(id uuid, session_id uuid, user_id uuid, joined_at timestamptz, checked_in boolean, first_name text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    sp.id,
    sp.session_id,
    sp.user_id,
    sp.joined_at,
    sp.checked_in,
    p.first_name,
    p.avatar_url
  FROM public.session_participants sp
  JOIN public.profiles p ON p.id = sp.user_id
  WHERE sp.session_id = p_session_id
    AND (p.shadow_banned = false OR p.shadow_banned IS NULL);
$$;

-- 9. Créer une vue pour les signaux proches (déjà dans get_nearby_signals mais avec protection)
-- La fonction get_nearby_signals existe déjà et inclut les protections nécessaires

-- 10. User settings - strictement privé
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- 11. Protection du shadow ban - créer une fonction pour le profil utilisateur
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE(
  id uuid, 
  email text, 
  first_name text, 
  avatar_url text, 
  university text, 
  bio text,
  birth_year integer,
  is_premium boolean, 
  created_at timestamptz, 
  updated_at timestamptz,
  favorite_activities text[],
  purchased_sessions integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.avatar_url,
    p.university,
    p.bio,
    p.birth_year,
    p.is_premium,
    p.created_at,
    p.updated_at,
    p.favorite_activities,
    p.purchased_sessions
    -- shadow_banned fields intentionally excluded
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

-- 12. Ajouter une politique pour les interactions plus stricte
DROP POLICY IF EXISTS "Users can view own interactions" ON interactions;
DROP POLICY IF EXISTS "Target users can view interactions involving them" ON interactions;

CREATE POLICY "Users can view own interactions"
  ON interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Target users can view basic interaction info"
  ON interactions FOR SELECT
  USING (auth.uid() = target_user_id);

-- 13. Protéger les messages - seulement les participants
DROP POLICY IF EXISTS "Participants can view session messages" ON session_messages;

CREATE POLICY "Participants can view session messages"
  ON session_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = session_messages.session_id
        AND sp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM scheduled_sessions ss
      WHERE ss.id = session_messages.session_id
        AND ss.creator_id = auth.uid()
    )
  );

-- 14. Nettoyer les anciennes politiques trop permissives sur profiles
DROP POLICY IF EXISTS "Authenticated users can view minimal profile info for signals" ON profiles;