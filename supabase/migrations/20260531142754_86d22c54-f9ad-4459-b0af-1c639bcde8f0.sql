
-- ============ revealed_clues ============
CREATE TABLE public.revealed_clues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_character_id TEXT NOT NULL,
  to_character_id TEXT NOT NULL,
  clue_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_character_id, to_character_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.revealed_clues TO anon, authenticated;
GRANT ALL ON public.revealed_clues TO service_role;

ALTER TABLE public.revealed_clues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read revealed_clues" ON public.revealed_clues FOR SELECT USING (true);
CREATE POLICY "public insert revealed_clues" ON public.revealed_clues FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete revealed_clues" ON public.revealed_clues FOR DELETE USING (true);

-- ============ chat_messages ============
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('global','corbeau')),
  sender_character_id TEXT NOT NULL,
  sender_display_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_channel_created ON public.chat_messages (channel, created_at);

GRANT SELECT, INSERT, DELETE ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete chat_messages" ON public.chat_messages FOR DELETE USING (true);

-- ============ timeline_events ============
CREATE TABLE public.timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_events_created ON public.timeline_events (created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.timeline_events TO anon, authenticated;
GRANT ALL ON public.timeline_events TO service_role;

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read timeline_events" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "public insert timeline_events" ON public.timeline_events FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete timeline_events" ON public.timeline_events FOR DELETE USING (true);

-- ============ game_state (singleton) ============
CREATE TABLE public.game_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phase TEXT NOT NULL DEFAULT 'intro',
  current_act INT NOT NULL DEFAULT 1,
  vote_open BOOLEAN NOT NULL DEFAULT false,
  accused_character_id TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.game_state TO anon, authenticated;
GRANT ALL ON public.game_state TO service_role;

ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read game_state" ON public.game_state FOR SELECT USING (true);
CREATE POLICY "public upsert game_state" ON public.game_state FOR INSERT WITH CHECK (true);
CREATE POLICY "public update game_state" ON public.game_state FOR UPDATE USING (true);

INSERT INTO public.game_state (id, phase) VALUES (1, 'intro') ON CONFLICT DO NOTHING;

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.revealed_clues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
