-- =============================================
-- SECURITY FIX: Corriger la fonction get_public_profile_secure
-- =============================================

-- 1. Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.get_public_profile_secure(uuid);

-- 2. Recréer avec le bon type de retour
CREATE OR REPLACE FUNCTION public.get_public_profile_secure(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  avatar_url text,
  bio text,
  university text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.avatar_url,
    p.bio,
    p.university
  FROM public.profiles p
  WHERE p.id = p_user_id
$$;