CREATE TABLE public.character_clues (
  character_id text PRIMARY KEY,
  key_phrase text,
  key_phrase_clue text,
  holder_character_id text,
  delivered boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.character_clues TO anon, authenticated;
GRANT ALL ON public.character_clues TO service_role;

ALTER TABLE public.character_clues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read character_clues" ON public.character_clues FOR SELECT USING (true);
CREATE POLICY "public insert character_clues" ON public.character_clues FOR INSERT WITH CHECK (true);
CREATE POLICY "public update character_clues" ON public.character_clues FOR UPDATE USING (true);
CREATE POLICY "public delete character_clues" ON public.character_clues FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.character_clues;