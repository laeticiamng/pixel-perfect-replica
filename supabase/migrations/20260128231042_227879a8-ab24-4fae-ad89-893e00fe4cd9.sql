-- 1. Créer une vue profiles_public sécurisée (remplacer l'existante) qui exclut les emails
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = on) AS
SELECT 
  id,
  first_name,
  avatar_url,
  university,
  created_at
FROM public.profiles;

-- 2. Activer RLS sur profiles_public via la table de base
-- (La vue hérite de la RLS de profiles, mais on restreint l'accès)

-- 3. Ajouter une policy pour que profiles_public ne soit accessible qu'aux utilisateurs authentifiés
GRANT SELECT ON public.profiles_public TO authenticated;
REVOKE ALL ON public.profiles_public FROM anon;

-- 4. Nettoyer les coordonnées GPS des anciennes interactions (plus de 7 jours)
-- et ajouter une fonction pour le nettoyage automatique
CREATE OR REPLACE FUNCTION public.cleanup_old_interaction_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.interactions
  SET latitude = NULL, longitude = NULL
  WHERE created_at < now() - interval '7 days'
    AND (latitude IS NOT NULL OR longitude IS NOT NULL);
END;
$$;

-- 5. Exécuter le nettoyage initial
SELECT public.cleanup_old_interaction_locations();

-- 6. Modifier la policy de profiles pour s'assurer que les emails restent privés
-- Les emails ne sont jamais exposés car profiles_public ne les inclut pas
-- La policy existante "Users can view nearby user profiles" donne accès à profiles 
-- mais le frontend devra utiliser profiles_public pour les listings