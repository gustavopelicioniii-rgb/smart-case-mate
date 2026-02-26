-- Melhorias QA: RLS multi-tenant — cada usuário vê/edita apenas seus dados.
-- Aplicar após 20250225200000 (process_movements) e 20250225220000 (office_expenses).
--
-- Nota: linhas com owner_id NULL não serão visíveis para ninguém (auth.uid() = NULL é falso).
-- Se existirem registros legados com owner_id NULL, atualize-os antes ou crie política específica.

-- 1) process_movements: SELECT apenas do próprio owner
DROP POLICY IF EXISTS "Users can view process_movements" ON public.process_movements;
CREATE POLICY "Users can view own process_movements" ON public.process_movements
  FOR SELECT USING (owner_id = auth.uid());
COMMENT ON POLICY "Users can view own process_movements" ON public.process_movements IS 'Multi-tenant: usuário vê apenas movimentações dos processos que possui (owner_id).';

-- 2) office_expenses: SELECT/UPDATE/DELETE apenas do próprio owner; INSERT só com owner_id = usuário atual
DROP POLICY IF EXISTS "Users can view office_expenses" ON public.office_expenses;
CREATE POLICY "Users can view own office_expenses" ON public.office_expenses
  FOR SELECT USING (owner_id = auth.uid());
COMMENT ON POLICY "Users can view own office_expenses" ON public.office_expenses IS 'Multi-tenant: usuário vê apenas suas próprias despesas.';

DROP POLICY IF EXISTS "Auth users can insert office_expenses" ON public.office_expenses;
CREATE POLICY "Users can insert own office_expenses" ON public.office_expenses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
COMMENT ON POLICY "Users can insert own office_expenses" ON public.office_expenses IS 'Usuário só pode inserir despesa com owner_id = seu próprio id.';

DROP POLICY IF EXISTS "Auth users can update office_expenses" ON public.office_expenses;
CREATE POLICY "Users can update own office_expenses" ON public.office_expenses
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Auth users can delete office_expenses" ON public.office_expenses;
CREATE POLICY "Users can delete own office_expenses" ON public.office_expenses
  FOR DELETE USING (owner_id = auth.uid());
