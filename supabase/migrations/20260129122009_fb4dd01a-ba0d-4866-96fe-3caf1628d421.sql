-- Add bio column to profiles (140 chars max)
ALTER TABLE public.profiles
ADD COLUMN bio TEXT;

-- Add location_description column to active_signals
ALTER TABLE public.active_signals
ADD COLUMN location_description TEXT;

-- Add emergency_contacts table for alert feature
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on emergency_contacts
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts"
ON public.emergency_contacts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts"
ON public.emergency_contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
ON public.emergency_contacts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
ON public.emergency_contacts
FOR DELETE
USING (auth.uid() = user_id);

-- Add constraint for bio length
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 140);

-- Add constraint for location_description length
ALTER TABLE public.active_signals
ADD CONSTRAINT signals_location_desc_length CHECK (char_length(location_description) <= 100);