-- =============================================
-- Monitoramento de processos (Escavador) + Planos + Movimentações
-- =============================================

-- 1) Campo last_checked_at em processos (1 consulta a cada 24h)
ALTER TABLE public.processos
  ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.processos.last_checked_at IS 'Última vez que o processo foi consultado na API (monitoramento). Usado para evitar polling no mesmo dia.';

-- 2) Plano no perfil (limite de processos por plano)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'start' CHECK (subscription_plan IN ('start', 'pro', 'elite'));

COMMENT ON COLUMN public.profiles.subscription_plan IS 'Plano: start=40, pro=100, elite=250 processos monitorados.';

-- 3) Tabela de movimentações relevantes (salvas pela API)
CREATE TABLE IF NOT EXISTS public.process_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  process_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  process_number TEXT NOT NULL,
  movement_date DATE NOT NULL,
  movement_type TEXT NOT NULL,
  full_text TEXT NOT NULL,
  is_relevant BOOLEAN NOT NULL DEFAULT true,
  external_id BIGINT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_process_movements_process_id ON public.process_movements(process_id);
CREATE INDEX IF NOT EXISTS idx_process_movements_process_number ON public.process_movements(process_number);
CREATE INDEX IF NOT EXISTS idx_process_movements_created_at ON public.process_movements(created_at DESC);

ALTER TABLE public.process_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view process_movements" ON public.process_movements
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage process_movements" ON public.process_movements
  FOR ALL USING (true);

-- 4) Logs de monitoramento (consulta, atualização, erro API)
CREATE TABLE IF NOT EXISTS public.process_monitor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  process_id UUID REFERENCES public.processos(id) ON DELETE SET NULL,
  process_number TEXT,
  log_type TEXT NOT NULL CHECK (log_type IN ('consulta_realizada', 'atualizacao_encontrada', 'erro_api')),
  message TEXT,
  details JSONB,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_process_monitor_logs_process_id ON public.process_monitor_logs(process_id);
CREATE INDEX IF NOT EXISTS idx_process_monitor_logs_created_at ON public.process_monitor_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_process_monitor_logs_log_type ON public.process_monitor_logs(log_type);

ALTER TABLE public.process_monitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own process_monitor_logs" ON public.process_monitor_logs
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Service role can insert process_monitor_logs" ON public.process_monitor_logs
  FOR INSERT WITH CHECK (true);

-- 5) Função para obter limite do plano
CREATE OR REPLACE FUNCTION public.get_plan_process_limit(plan_name TEXT)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE plan_name
    WHEN 'start' THEN 40
    WHEN 'pro' THEN 100
    WHEN 'elite' THEN 250
    ELSE 40
  END;
$$;

-- 6) Verificação de limite ao inserir processo (opcional: trigger ou checagem na app)
-- A aplicação deve checar antes de inserir: count(processos WHERE owner_id = X) < get_plan_process_limit(profile.subscription_plan)
