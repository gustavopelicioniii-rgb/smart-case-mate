-- =============================================
-- MODULE 1: PROCESSOS (Lawsuits)
-- =============================================

CREATE TABLE processos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  number TEXT NOT NULL,                    -- Número do processo (ex: 0012345-67.2024.8.26.0100)
  client TEXT NOT NULL,                    -- Nome do cliente
  court TEXT NOT NULL,                     -- Tribunal (TJ-SP, TRT-2, etc)
  class TEXT NOT NULL DEFAULT '',          -- Classe processual
  subject TEXT NOT NULL DEFAULT '',        -- Assunto
  active_party TEXT NOT NULL DEFAULT '',   -- Parte ativa (autor)
  passive_party TEXT NOT NULL DEFAULT '',  -- Parte passiva (réu)
  responsible TEXT NOT NULL DEFAULT '',    -- Advogado responsável
  phase TEXT NOT NULL DEFAULT '',          -- Fase processual
  status TEXT NOT NULL DEFAULT 'Em andamento' CHECK (status IN ('Em andamento', 'Aguardando prazo', 'Concluído', 'Suspenso')),
  next_deadline DATE,                      -- Próximo prazo
  last_movement TEXT NOT NULL DEFAULT '',  -- Última movimentação
  value NUMERIC(15,2) DEFAULT 0,           -- Valor da causa
  docs_count INTEGER DEFAULT 0,           -- Qtde documentos vinculados
  
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all processos" ON processos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert processos" ON processos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update processos" ON processos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete processos" ON processos
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER processos_updated_at
  BEFORE UPDATE ON processos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
