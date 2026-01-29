-- Create admin_alert_preferences table
CREATE TABLE public.admin_alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  alert_new_user BOOLEAN NOT NULL DEFAULT true,
  alert_high_reports BOOLEAN NOT NULL DEFAULT true,
  alert_error_spike BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_alert_preferences ENABLE ROW LEVEL SECURITY;

-- Only admins can manage their own preferences
CREATE POLICY "Admins can manage own preferences" 
ON public.admin_alert_preferences 
FOR ALL 
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id)
WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

-- Create alert_logs table to track sent alerts
CREATE TABLE public.alert_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view alert logs
CREATE POLICY "Admins can view alert logs" 
ON public.alert_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_admin_alert_preferences_updated_at
BEFORE UPDATE ON public.admin_alert_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();