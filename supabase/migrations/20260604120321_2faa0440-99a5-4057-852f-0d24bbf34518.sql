CREATE TABLE public.suspect_statuses (
  investigator_character_id text NOT NULL,
  target_character_id text NOT NULL,
  status text NOT NULL DEFAULT 'suspect',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (investigator_character_id, target_character_id),
  CONSTRAINT suspect_statuses_status_check CHECK (status IN ('coupable','suspect','innocent'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suspect_statuses TO anon, authenticated;
GRANT ALL ON public.suspect_statuses TO service_role;

ALTER TABLE public.suspect_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suspect_statuses readable by all"
  ON public.suspect_statuses FOR SELECT USING (true);

CREATE POLICY "suspect_statuses writable by all"
  ON public.suspect_statuses FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.suspect_statuses;