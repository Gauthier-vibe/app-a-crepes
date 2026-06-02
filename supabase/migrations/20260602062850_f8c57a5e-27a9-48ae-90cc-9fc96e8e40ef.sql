
CREATE TABLE public.feature_flags (
  feature_key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  beta_only BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feature_flags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags readable by all"
ON public.feature_flags FOR SELECT
USING (true);

CREATE POLICY "feature_flags writable by all"
ON public.feature_flags FOR ALL
USING (true) WITH CHECK (true);

INSERT INTO public.feature_flags (feature_key, label, beta_only) VALUES
  ('relations', 'Relations entre personnages', true),
  ('role', 'Fiche Rôle (mission / coupable)', true)
ON CONFLICT (feature_key) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_flags;
