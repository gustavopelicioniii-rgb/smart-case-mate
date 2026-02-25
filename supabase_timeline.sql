-- =============================================
-- E3: TIMELINE E DETALHES DO PROCESSO
-- Tabelas para andamentos, audiências e notas
-- =============================================

-- Tabela de andamentos (Timeline)
CREATE TABLE IF NOT EXISTS andamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    process_id UUID REFERENCES processos(id) ON DELETE CASCADE NOT NULL,
    data TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tipo TEXT NOT NULL, -- 'Movimentação', 'Despacho', 'Decisão', 'Petição', etc.
    descricao TEXT NOT NULL,
    responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de audiências
CREATE TABLE IF NOT EXISTS audiencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    process_id UUID REFERENCES processos(id) ON DELETE CASCADE NOT NULL,
    data TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo TEXT NOT NULL, -- 'Conciliação', 'Instrução', 'Julgamento', etc.
    local TEXT,
    link_meet TEXT,
    status TEXT NOT NULL DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Realizada', 'Cancelada', 'Adiada')),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de notas internas
CREATE TABLE IF NOT EXISTS notas_processo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    process_id UUID REFERENCES processos(id) ON DELETE CASCADE NOT NULL,
    autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    conteudo TEXT NOT NULL,
    privada BOOLEAN DEFAULT false,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE andamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_processo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own andamentos" ON andamentos FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage own audiencias" ON audiencias FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage own notas" ON notas_processo FOR ALL USING (auth.uid() = owner_id);

-- Triggers para updated_at
CREATE TRIGGER audiencias_updated_at BEFORE UPDATE ON audiencias FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER notas_processo_updated_at BEFORE UPDATE ON notas_processo FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
