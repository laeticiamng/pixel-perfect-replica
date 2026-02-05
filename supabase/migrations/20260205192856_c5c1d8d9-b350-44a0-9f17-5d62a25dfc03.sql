-- Fix remaining policy
DROP POLICY IF EXISTS "Admins can view own preferences only" ON public.admin_alert_preferences;

CREATE POLICY "Admins can view strictly own preferences"
ON public.admin_alert_preferences
FOR SELECT
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'));