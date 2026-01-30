-- Fix user_reliability RLS: Remove user self-update capability
-- Only system functions should modify reliability scores

-- Drop the problematic policy that allows users to update their own reliability
DROP POLICY IF EXISTS "Users can update their own reliability" ON public.user_reliability;

-- Ensure the system-only update policy exists (USING false means no direct updates allowed)
DROP POLICY IF EXISTS "System updates reliability via RPC" ON public.user_reliability;
CREATE POLICY "System updates reliability via RPC" 
ON public.user_reliability 
FOR UPDATE 
USING (false)
WITH CHECK (false);

-- Verify users can still read their own reliability (for display purposes)
DROP POLICY IF EXISTS "Users can view their own reliability" ON public.user_reliability;
CREATE POLICY "Users can view their own reliability" 
ON public.user_reliability 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all reliability scores for moderation
DROP POLICY IF EXISTS "Admins can view all reliability" ON public.user_reliability;
CREATE POLICY "Admins can view all reliability" 
ON public.user_reliability 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));