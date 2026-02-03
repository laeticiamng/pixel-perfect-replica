-- Ajouter la colonne birth_year à la table profiles pour le matching par âge
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_year integer;

-- Ajouter une contrainte de validation sur l'année de naissance
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_birth_year_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_birth_year_check 
CHECK (birth_year IS NULL OR (birth_year >= 1920 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE) - 13));