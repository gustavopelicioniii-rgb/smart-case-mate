-- Notas e documentos por processo (abas Docs e Notas na tela de detalhe do processo).

-- 1) Notas do processo
CREATE TABLE IF NOT EXISTS public.process_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  process_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_process_notes_process_id ON public.process_notes(process_id);
CREATE INDEX IF NOT EXISTS idx_process_notes_owner_id ON public.process_notes(owner_id);

ALTER TABLE public.process_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own process_notes" ON public.process_notes;
CREATE POLICY "Users can view own process_notes" ON public.process_notes
  FOR SELECT USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own process_notes" ON public.process_notes;
CREATE POLICY "Users can insert own process_notes" ON public.process_notes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own process_notes" ON public.process_notes;
CREATE POLICY "Users can update own process_notes" ON public.process_notes
  FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete own process_notes" ON public.process_notes;
CREATE POLICY "Users can delete own process_notes" ON public.process_notes
  FOR DELETE USING (owner_id = auth.uid());

COMMENT ON TABLE public.process_notes IS 'Notas internas por processo (aba Notas no detalhe do processo).';

-- 2) Documentos/referências do processo (título, link ou caminho de arquivo, descrição)
CREATE TABLE IF NOT EXISTS public.process_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  process_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  url TEXT,
  file_path TEXT,
  description TEXT DEFAULT '',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_process_documents_process_id ON public.process_documents(process_id);
CREATE INDEX IF NOT EXISTS idx_process_documents_owner_id ON public.process_documents(owner_id);

ALTER TABLE public.process_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own process_documents" ON public.process_documents;
CREATE POLICY "Users can view own process_documents" ON public.process_documents
  FOR SELECT USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own process_documents" ON public.process_documents;
CREATE POLICY "Users can insert own process_documents" ON public.process_documents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own process_documents" ON public.process_documents;
CREATE POLICY "Users can update own process_documents" ON public.process_documents
  FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete own process_documents" ON public.process_documents;
CREATE POLICY "Users can delete own process_documents" ON public.process_documents
  FOR DELETE USING (owner_id = auth.uid());

COMMENT ON TABLE public.process_documents IS 'Documentos/links por processo (aba Docs). URL externa ou file_path (Storage).';

-- Trigger updated_at para process_notes
CREATE OR REPLACE FUNCTION set_process_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS process_notes_updated_at ON public.process_notes;
CREATE TRIGGER process_notes_updated_at
  BEFORE UPDATE ON public.process_notes
  FOR EACH ROW EXECUTE PROCEDURE set_process_notes_updated_at();
