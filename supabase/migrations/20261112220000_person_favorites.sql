-- Personal, one-way favorites. Never grant visibility or location access.
CREATE TABLE IF NOT EXISTS public.person_favorites (
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  favorite_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, favorite_id),
  CONSTRAINT person_favorites_not_self CHECK (owner_id <> favorite_id)
);
CREATE INDEX IF NOT EXISTS person_favorites_favorite_idx ON public.person_favorites (favorite_id);
ALTER TABLE public.person_favorites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.person_favorites FROM anon;
GRANT SELECT, INSERT, DELETE ON public.person_favorites TO authenticated;
CREATE POLICY "Owner can read favorites" ON public.person_favorites
  FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "Owner can add favorites" ON public.person_favorites
  FOR INSERT TO authenticated WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND favorite_id <> owner_id
    AND EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.status = 'accepted'
      AND ((c.user_a = owner_id AND c.user_b = favorite_id)
        OR (c.user_b = owner_id AND c.user_a = favorite_id))
    )
  );
CREATE POLICY "Owner can remove favorites" ON public.person_favorites
  FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()));
-- No UPDATE, no realtime publication: favorites remain private to their owner.
