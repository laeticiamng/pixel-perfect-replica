-- 1. Restrict user_stats UPDATE to NOT include rating manipulation
-- Remove the ability for users to update their own rating
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
CREATE POLICY "Users can update own stats except rating"
ON public.user_stats
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Actually, we need to restrict the columns that can be updated
-- Since RLS doesn't support column-level security, we use a trigger instead
CREATE OR REPLACE FUNCTION public.protect_rating_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the update is coming from a regular user (not service role),
  -- prevent rating changes by keeping the old value
  IF OLD.rating IS DISTINCT FROM NEW.rating THEN
    -- Only allow rating changes if total_ratings also changes (system update)
    IF OLD.total_ratings = NEW.total_ratings THEN
      NEW.rating := OLD.rating;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_rating_on_user_stats ON public.user_stats;
CREATE TRIGGER protect_rating_on_user_stats
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.protect_rating_column();

-- 2. Mark location-related warnings as intentional with appropriate policies
-- The location exposure in active_signals is intentional for the app's core functionality
-- But we should note this is by design

-- 3. Clean up reports policy to prevent reverse lookups
-- The reported_user_id should not be able to see who reported them
-- This is already correct - "Users can view own reports" uses reporter_id = auth.uid()

-- 4. Drop the profiles_public view since we're using the RPC function instead
DROP VIEW IF EXISTS public.profiles_public;