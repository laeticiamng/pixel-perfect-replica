-- ============================================
-- AUDIT SÉCURITÉ - CORRECTIONS RLS CRITIQUES
-- ============================================

-- 1. Profiles: Ajouter politique pour empêcher accès anonyme
-- Les profils publics sont accessibles via des fonctions RPC sécurisées (get_public_profile)
-- Mais on doit s'assurer que les users authentifiés peuvent voir les profils des personnes avec qui ils interagissent

DROP POLICY IF EXISTS "Users can view profiles of people they interact with" ON public.profiles;
CREATE POLICY "Users can view profiles of people they interact with"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.interactions 
      WHERE (user_id = auth.uid() AND target_user_id = profiles.id)
         OR (target_user_id = auth.uid() AND user_id = profiles.id)
    )
    OR EXISTS (
      SELECT 1 FROM public.active_signals
      WHERE user_id = profiles.id
        AND expires_at > now()
    )
  )
);

-- Drop the old policy that was too restrictive
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. Active signals: Renforcer la politique SELECT pour exiger l'authentification
DROP POLICY IF EXISTS "Users can view active signals nearby" ON public.active_signals;
CREATE POLICY "Authenticated users can view active signals nearby"
ON public.active_signals FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id 
    OR (
      expires_at > now() 
      AND NOT EXISTS (
        SELECT 1 FROM public.user_settings us 
        WHERE us.user_id = active_signals.user_id 
        AND us.ghost_mode = true
      )
    )
  )
);

-- 3. Emergency contacts: Vérifier que seul l'utilisateur peut y accéder (déjà bon mais on confirme)
-- Les policies existantes sont correctes (auth.uid() = user_id)

-- 4. User stats: Renforcer pour exiger l'authentification
DROP POLICY IF EXISTS "Users can view nearby user stats" ON public.user_stats;
CREATE POLICY "Authenticated users can view nearby user stats"
ON public.user_stats FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.active_signals
      WHERE active_signals.user_id = user_stats.user_id
        AND active_signals.expires_at > now()
    )
  )
);

-- Drop old own stats policy if exists to avoid duplicates
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;

-- 5. Ajouter une contrainte de validation sur les interactions pour éviter les auto-interactions
ALTER TABLE public.interactions DROP CONSTRAINT IF EXISTS interactions_no_self_interaction;
ALTER TABLE public.interactions ADD CONSTRAINT interactions_no_self_interaction 
  CHECK (user_id != target_user_id);

-- 6. Ajouter un index pour améliorer les performances des requêtes de proximité
CREATE INDEX IF NOT EXISTS idx_active_signals_expires_at ON public.active_signals(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_signals_user_id ON public.active_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON public.interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_target_user_id ON public.interactions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON public.interactions(created_at DESC);

-- 7. Ajouter une validation sur le champ email des profiles (format)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_format;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 8. Ajouter une validation sur first_name (longueur min/max)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_first_name_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_first_name_length 
  CHECK (char_length(first_name) >= 1 AND char_length(first_name) <= 50);

-- 9. Ajouter une validation sur la bio (longueur max)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bio_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_length 
  CHECK (bio IS NULL OR char_length(bio) <= 140);

-- 10. Ajouter une validation sur emergency_contacts (téléphone format basique)
ALTER TABLE public.emergency_contacts DROP CONSTRAINT IF EXISTS emergency_contacts_phone_format;
ALTER TABLE public.emergency_contacts ADD CONSTRAINT emergency_contacts_phone_format 
  CHECK (phone ~ '^[0-9+\-\s\(\)]{6,20}$');

-- 11. Ajouter une validation sur emergency_contacts (nom longueur)
ALTER TABLE public.emergency_contacts DROP CONSTRAINT IF EXISTS emergency_contacts_name_length;
ALTER TABLE public.emergency_contacts ADD CONSTRAINT emergency_contacts_name_length 
  CHECK (char_length(name) >= 1 AND char_length(name) <= 50);