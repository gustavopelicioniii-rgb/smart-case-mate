-- =============================================
-- MODULE 6: PEÇAS (Generated legal documents)
-- =============================================

CREATE TABLE pecas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  title TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT '',           -- Petição Inicial, Contestação, Recurso, etc.
  context TEXT NOT NULL DEFAULT '',        -- User-provided context
  generated_text TEXT NOT NULL DEFAULT '', -- AI-generated text
  process_number TEXT NOT NULL DEFAULT '', -- Optional linked process

  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE pecas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pecas" ON pecas FOR SELECT USING (true);
CREATE POLICY "Auth users can insert pecas" ON pecas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update pecas" ON pecas FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete pecas" ON pecas FOR DELETE USING (auth.uid() IS NOT NULL);
