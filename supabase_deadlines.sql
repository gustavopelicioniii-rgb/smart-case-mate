-- =============================================
-- E1: ALERTAS REAIS DE PRAZO
-- Adiciona tabelas para prazos e feriados forenses
-- =============================================

-- Tabela de feriados forenses (Nacionais + Estaduais)
CREATE TABLE IF NOT EXISTS feriados_forenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    tribunal TEXT NOT NULL DEFAULT 'Nacional', -- 'Nacional', 'TJSP', 'TRT2', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de prazos processuais
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    process_id UUID REFERENCES processos(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    dias_uteis INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Concluído', 'Vencido', 'Cancelado')),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE feriados_forenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

-- Políticas para feriados (leitura pública para usuários autenticados)
CREATE POLICY "Auth users can view holidays" ON feriados_forenses 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para deadlines (apenas o dono ou administrador)
CREATE POLICY "Users can manage own deadlines" ON deadlines 
    FOR ALL USING (auth.uid() = owner_id);

-- Trigger para updated_at
CREATE TRIGGER deadlines_updated_at BEFORE UPDATE ON deadlines FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Dados iniciais (exemplos de feriados nacionais 2026)
INSERT INTO feriados_forenses (data, descricao, tribunal) VALUES
('2026-01-01', 'Confraternização Universal', 'Nacional'),
('2026-02-16', 'Carnaval', 'Nacional'),
('2026-02-17', 'Carnaval', 'Nacional'),
('2026-04-03', 'Sexta-feira Santa', 'Nacional'),
('2026-04-21', 'Tiradentes', 'Nacional'),
('2026-05-01', 'Dia do Trabalho', 'Nacional'),
('2026-06-04', 'Corpus Christi', 'Nacional'),
('2026-09-07', 'Independência do Brasil', 'Nacional'),
('2026-10-12', 'Nossa Senhora Aparecida', 'Nacional'),
('2026-11-02', 'Finados', 'Nacional'),
('2026-11-15', 'Proclamação da República', 'Nacional'),
('2026-12-25', 'Natal', 'Nacional');
