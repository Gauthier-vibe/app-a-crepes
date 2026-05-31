
-- Add image_url to chat messages
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.chat_messages ALTER COLUMN content DROP NOT NULL;

-- Create public bucket for chat media
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can read, anyone can upload (no auth in this app)
DROP POLICY IF EXISTS "chat-media public read" ON storage.objects;
CREATE POLICY "chat-media public read" ON storage.objects FOR SELECT USING (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "chat-media public insert" ON storage.objects;
CREATE POLICY "chat-media public insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-media');
