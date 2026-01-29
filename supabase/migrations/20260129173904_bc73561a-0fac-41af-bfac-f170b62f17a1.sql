-- =============================================
-- FEATURE: Limite créneaux gratuits (4/mois) + Vérification .edu
-- =============================================

-- 1. Ajouter colonne premium aux profils
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

-- 2. Créer table pour suivre les créneaux créés par mois
CREATE TABLE IF NOT EXISTS public.monthly_session_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- Format: '2026-01'
  sessions_created integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- 3. RLS pour monthly_session_usage
ALTER TABLE public.monthly_session_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON public.monthly_session_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
ON public.monthly_session_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
ON public.monthly_session_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Fonction pour vérifier si l'utilisateur peut créer un créneau
CREATE OR REPLACE FUNCTION public.can_create_session(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium boolean;
  v_current_month text;
  v_sessions_count integer;
  v_free_limit integer := 4;
BEGIN
  -- Vérifier si premium
  SELECT is_premium INTO v_is_premium
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_is_premium THEN
    RETURN true;
  END IF;
  
  -- Compter les créneaux du mois en cours
  v_current_month := to_char(now(), 'YYYY-MM');
  
  SELECT COALESCE(sessions_created, 0) INTO v_sessions_count
  FROM monthly_session_usage
  WHERE user_id = p_user_id AND month_year = v_current_month;
  
  RETURN COALESCE(v_sessions_count, 0) < v_free_limit;
END;
$$;

-- 5. Fonction pour incrémenter le compteur après création
CREATE OR REPLACE FUNCTION public.increment_session_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_month text;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  INSERT INTO monthly_session_usage (user_id, month_year, sessions_created)
  VALUES (NEW.creator_id, v_current_month, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    sessions_created = monthly_session_usage.sessions_created + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- 6. Trigger sur création de session
DROP TRIGGER IF EXISTS on_session_created ON public.scheduled_sessions;
CREATE TRIGGER on_session_created
  AFTER INSERT ON public.scheduled_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_session_count();

-- 7. Fonction pour vérifier et ajouter badge .edu automatiquement
CREATE OR REPLACE FUNCTION public.check_and_add_edu_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_is_edu boolean := false;
BEGIN
  v_email := NEW.email;
  
  -- Vérifier si email étudiant français
  IF v_email ~ '\.(edu|edu\.fr|univ-.*\.fr|etu\..*\.fr|student\..*\.fr|etudiant\..*\.fr|u-.*\.fr)$' THEN
    v_is_edu := true;
  END IF;
  
  -- Liste étendue des domaines étudiants français
  IF v_email ~ '@(ens\.fr|polytechnique\.edu|mines-.*\.fr|enpc\.fr|supelec\.fr|hec\.fr|essec\.edu|escp\.eu|sciencespo\.fr|dauphine\.psl\.eu|sorbonne-universite\.fr|universite-paris-saclay\.fr|ec-.*\.fr|insa-.*\.fr|centralesupelec\.fr|ensta\.fr|telecom-paris\.fr)$' THEN
    v_is_edu := true;
  END IF;
  
  IF v_is_edu THEN
    -- Ajouter le badge étudiant vérifié
    INSERT INTO verification_badges (user_id, badge_type, metadata)
    VALUES (NEW.id, 'student_verified', jsonb_build_object('email_domain', split_part(v_email, '@', 2)))
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Trigger sur insertion/update de profil
DROP TRIGGER IF EXISTS check_edu_on_profile ON public.profiles;
CREATE TRIGGER check_edu_on_profile
  AFTER INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_add_edu_badge();

-- 9. Fonction pour obtenir l'usage du mois courant
CREATE OR REPLACE FUNCTION public.get_current_month_usage(p_user_id uuid)
RETURNS TABLE(
  sessions_created integer,
  sessions_limit integer,
  is_premium boolean,
  can_create boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium boolean;
  v_current_month text;
  v_sessions_count integer;
  v_limit integer;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  SELECT p.is_premium INTO v_is_premium
  FROM profiles p
  WHERE p.id = p_user_id;
  
  SELECT COALESCE(m.sessions_created, 0) INTO v_sessions_count
  FROM monthly_session_usage m
  WHERE m.user_id = p_user_id AND m.month_year = v_current_month;
  
  v_limit := CASE WHEN v_is_premium THEN -1 ELSE 4 END; -- -1 = illimité
  
  RETURN QUERY SELECT 
    COALESCE(v_sessions_count, 0),
    v_limit,
    COALESCE(v_is_premium, false),
    public.can_create_session(p_user_id);
END;
$$;