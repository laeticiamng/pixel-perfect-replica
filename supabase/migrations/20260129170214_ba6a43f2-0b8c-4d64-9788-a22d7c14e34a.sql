-- Add INSERT policy for user_reliability (for when creating sessions)
CREATE POLICY "Users can insert their own reliability"
ON public.user_reliability
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for user_reliability
CREATE POLICY "Users can update their own reliability"
ON public.user_reliability
FOR UPDATE
USING (auth.uid() = user_id);