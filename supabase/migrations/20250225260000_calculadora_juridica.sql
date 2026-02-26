-- Calculadora Jurídica Estratégica: tabelas base (dev.md §14)
-- Multi-tenant por owner_id; parâmetros e resultado em JSON para versionamento e reprocessamento.

-- 1) Índices oficiais (IPCA, INPC, IGP-M, SELIC, TR, etc.) — valores mensais para correção
CREATE TABLE IF NOT EXISTS public.indices_oficiais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  indice TEXT NOT NULL,
  referencia DATE NOT NULL,
  valor NUMERIC(18, 8) NOT NULL,
  UNIQUE (indice, referencia)
);
CREATE INDEX IF NOT EXISTS idx_indices_oficiais_indice_ref ON public.indices_oficiais(indice, referencia);
COMMENT ON TABLE public.indices_oficiais IS 'Valores mensais dos índices (IPCA, INPC, IGP-M, SELIC, TR) para cálculos de correção.';

-- 2) Cálculos (cabeçalho + parametros_json + resultado_json)
CREATE TABLE IF NOT EXISTS public.calculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cliente_id UUID,
  processo_id UUID REFERENCES public.processos(id) ON DELETE SET NULL,
  tipo_calculo TEXT NOT NULL,
  versao_formula INTEGER NOT NULL DEFAULT 1,
  parametros_json JSONB NOT NULL DEFAULT '{}',
  resultado_json JSONB,
  hash_integridade TEXT,
  titulo TEXT
);
CREATE INDEX IF NOT EXISTS idx_calculos_owner ON public.calculos(owner_id);
CREATE INDEX IF NOT EXISTS idx_calculos_tipo ON public.calculos(tipo_calculo);
CREATE INDEX IF NOT EXISTS idx_calculos_created ON public.calculos(created_at DESC);
COMMENT ON TABLE public.calculos IS 'Registro de cada cálculo: parâmetros e resultado em JSON para auditoria e reprocessamento.';

-- 3) Logs de cálculo (auditoria)
CREATE TABLE IF NOT EXISTS public.calculo_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  calculo_id UUID REFERENCES public.calculos(id) ON DELETE CASCADE,
  evento TEXT NOT NULL,
  detalhes JSONB
);
CREATE INDEX IF NOT EXISTS idx_calculo_logs_calculo ON public.calculo_logs(calculo_id);
COMMENT ON TABLE public.calculo_logs IS 'Log de eventos por cálculo (criação, reprocessamento, exportação).';

-- RLS
ALTER TABLE public.calculos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own calculos" ON public.calculos;
CREATE POLICY "Users can view own calculos" ON public.calculos FOR SELECT USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own calculos" ON public.calculos;
CREATE POLICY "Users can insert own calculos" ON public.calculos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own calculos" ON public.calculos;
CREATE POLICY "Users can update own calculos" ON public.calculos FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete own calculos" ON public.calculos;
CREATE POLICY "Users can delete own calculos" ON public.calculos FOR DELETE USING (owner_id = auth.uid());

-- indices_oficiais: leitura pública (ou por autenticado) para o serviço de cálculo
ALTER TABLE public.indices_oficiais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read indices" ON public.indices_oficiais;
CREATE POLICY "Authenticated can read indices" ON public.indices_oficiais FOR SELECT USING (auth.uid() IS NOT NULL);

-- calculo_logs: usuário só vê logs dos próprios cálculos (via calculo_id -> calculos.owner_id)
ALTER TABLE public.calculo_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view logs of own calculos" ON public.calculo_logs;
CREATE POLICY "Users can view logs of own calculos" ON public.calculo_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.calculos c WHERE c.id = calculo_logs.calculo_id AND c.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS "Users can insert logs for own calculos" ON public.calculo_logs;
CREATE POLICY "Users can insert logs for own calculos" ON public.calculo_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.calculos c WHERE c.id = calculo_logs.calculo_id AND c.owner_id = auth.uid())
  );
