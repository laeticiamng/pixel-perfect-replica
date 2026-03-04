
-- Replace overly permissive insert policy with user-scoped one
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
