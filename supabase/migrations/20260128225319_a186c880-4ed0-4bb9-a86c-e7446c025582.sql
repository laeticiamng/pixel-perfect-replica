-- Create function to increment interactions
CREATE OR REPLACE FUNCTION public.increment_interactions(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.user_stats
  SET interactions = interactions + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to add hours active
CREATE OR REPLACE FUNCTION public.add_hours_active(p_user_id UUID, p_hours NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE public.user_stats
  SET hours_active = hours_active + p_hours
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;