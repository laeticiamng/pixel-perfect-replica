-- Add language preference column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' 
CHECK (language_preference IN ('en', 'fr'));