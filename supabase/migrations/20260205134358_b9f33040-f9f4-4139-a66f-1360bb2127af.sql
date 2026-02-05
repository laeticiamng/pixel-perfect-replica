-- Fix admin_alert_preferences RLS policy to only allow admins to view their own preferences
-- This prevents admins from seeing other admins' email addresses

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Admins can manage own preferences" ON public.admin_alert_preferences;

-- Create a more restrictive SELECT policy
CREATE POLICY "Admins can view own preferences only"
ON public.admin_alert_preferences
FOR SELECT
USING (has_role(auth.uid(), 'admin'::text) AND auth.uid() = user_id);

-- Create separate INSERT policy for own records
CREATE POLICY "Admins can insert own preferences"
ON public.admin_alert_preferences
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::text) AND auth.uid() = user_id);

-- Create separate UPDATE policy for own records
CREATE POLICY "Admins can update own preferences"
ON public.admin_alert_preferences
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::text) AND auth.uid() = user_id);

-- Create separate DELETE policy for own records
CREATE POLICY "Admins can delete own preferences"
ON public.admin_alert_preferences
FOR DELETE
USING (has_role(auth.uid(), 'admin'::text) AND auth.uid() = user_id);