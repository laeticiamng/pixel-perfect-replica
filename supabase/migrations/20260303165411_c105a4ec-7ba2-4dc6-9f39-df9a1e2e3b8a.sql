
-- Add referral_code column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate referral codes for existing users
UPDATE public.profiles 
SET referral_code = UPPER(SUBSTR(REPLACE(id::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- Create function to auto-generate referral code on new user
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTR(REPLACE(NEW.id::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  rewarded boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own referrals as referrer"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referral as referred"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referred_id);

-- No direct insert/update/delete from client
CREATE POLICY "No direct insert"
  ON public.referrals FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update"
  ON public.referrals FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete"
  ON public.referrals FOR DELETE
  USING (false);

-- RPC to apply a referral (called by edge function via service role)
CREATE OR REPLACE FUNCTION public.apply_referral(p_referrer_code text, p_referred_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_already_referred boolean;
BEGIN
  -- Find referrer by code
  SELECT id INTO v_referrer_id FROM profiles WHERE referral_code = p_referrer_code;
  IF v_referrer_id IS NULL THEN RETURN false; END IF;
  
  -- Cannot self-refer
  IF v_referrer_id = p_referred_id THEN RETURN false; END IF;
  
  -- Check if already referred
  SELECT EXISTS(SELECT 1 FROM referrals WHERE referred_id = p_referred_id) INTO v_already_referred;
  IF v_already_referred THEN RETURN false; END IF;
  
  -- Create referral record
  INSERT INTO referrals (referrer_id, referred_id, code, status, rewarded)
  VALUES (v_referrer_id, p_referred_id, p_referrer_code, 'completed', true);
  
  -- Reward referrer with +1 purchased session
  UPDATE profiles SET purchased_sessions = COALESCE(purchased_sessions, 0) + 1, updated_at = now()
  WHERE id = v_referrer_id;
  
  RETURN true;
END;
$$;
