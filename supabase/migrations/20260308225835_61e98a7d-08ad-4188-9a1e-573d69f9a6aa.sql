
-- Fix P0: Remove overly permissive ALL policy on admin_alert_preferences
DROP POLICY IF EXISTS "Users can manage own admin preferences" ON public.admin_alert_preferences;
-- Fix P1: Remove overly permissive SELECT policy on admin_alert_preferences  
DROP POLICY IF EXISTS "Users can view own admin preferences" ON public.admin_alert_preferences;
