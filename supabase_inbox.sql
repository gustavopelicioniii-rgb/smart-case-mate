-- =============================================
-- E2: CAIXA DE ENTRADA JURÍDICA (INBOX)
-- Feed unificado de atualizações
-- =============================================

CREATE TABLE IF NOT EXISTS inbox_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('Publicação', 'Andamento', 'Documento', 'Tarefa', 'Sistema')),
    titulo TEXT NOT NULL,
    descricao TEXT,
    referencia_id UUID, -- ID do processo, documento ou tarefa relacionado
    lido BOOLEAN DEFAULT false,
    prioridade TEXT DEFAULT 'Normal' CHECK (prioridade IN ('Baixa', 'Normal', 'Alta', 'Urgente')),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own inbox" ON inbox_items
    FOR ALL USING (auth.uid() = owner_id);

-- Trigger para updated_at
CREATE TRIGGER inbox_items_updated_at BEFORE UPDATE ON inbox_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- View para atualizações de hoje
CREATE OR REPLACE VIEW inbox_today AS
SELECT * FROM inbox_items
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;
