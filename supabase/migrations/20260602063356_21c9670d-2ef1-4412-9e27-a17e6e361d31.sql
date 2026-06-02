
CREATE TABLE public.character_settings (
  character_id TEXT PRIMARY KEY,
  hidden_role_key TEXT,
  is_beta_tester BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.character_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.character_settings TO authenticated;
GRANT ALL ON public.character_settings TO service_role;

ALTER TABLE public.character_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "character_settings readable by all"
ON public.character_settings FOR SELECT
USING (true);

CREATE POLICY "character_settings writable by all"
ON public.character_settings FOR ALL
USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.character_settings;
