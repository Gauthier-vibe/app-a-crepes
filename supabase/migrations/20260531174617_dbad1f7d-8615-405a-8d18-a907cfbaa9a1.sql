
CREATE TABLE public.killer_missions (
  character_id text PRIMARY KEY,
  target_character_id text NOT NULL,
  mission text NOT NULL,
  alive boolean NOT NULL DEFAULT true,
  killed_at timestamptz,
  killed_by text,
  kills_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.killer_missions TO anon, authenticated;
GRANT ALL ON public.killer_missions TO service_role;

ALTER TABLE public.killer_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read killer_missions" ON public.killer_missions FOR SELECT USING (true);
CREATE POLICY "public insert killer_missions" ON public.killer_missions FOR INSERT WITH CHECK (true);
CREATE POLICY "public update killer_missions" ON public.killer_missions FOR UPDATE USING (true);
CREATE POLICY "public delete killer_missions" ON public.killer_missions FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.killer_missions;

INSERT INTO public.killer_missions (character_id, target_character_id, mission) VALUES
  ('agathe',     'lucas',      'Faire dire le mot « crêpe » à ta cible sans qu''elle ne s''en rende compte.'),
  ('lucas',      'arthur',     'Convaincre ta cible de te raconter un souvenir d''enfance.'),
  ('arthur',     'eugenie',    'Faire trinquer ta cible avec toi en disant « aux secrets bien gardés ».'),
  ('eugenie',    'herve',      'Faire danser ta cible pendant au moins trente secondes.'),
  ('herve',      'gauthier',   'Glisser le mot « scandale » dans une conversation avec ta cible.'),
  ('gauthier',   'julie',      'Prendre un selfie avec ta cible.'),
  ('julie',      'antoine',    'Faire rire ta cible aux éclats.'),
  ('antoine',    'lenaic',     'Faire dire « je le savais » à ta cible.'),
  ('lenaic',     'leopold',    'Offrir une bouchée de quelque chose à ta cible.'),
  ('leopold',    'christelle', 'Obtenir un compliment sincère de ta cible.'),
  ('christelle', 'claire',     'Faire chanter ta cible (au moins une phrase à voix haute).'),
  ('claire',     'victorine',  'Faire jurer ta cible.'),
  ('victorine',  'agathe',     'Convaincre ta cible de te confier un petit secret.');
