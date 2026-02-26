-- Permite que usuários autenticados leiam todos os perfis (para dropdown Advogado Responsável e página Equipe).
-- Sem esta política, RLS pode restringir a apenas o próprio perfil e outros membros (ex.: Doutora Júlia) não aparecem.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read all profiles for team" ON public.profiles;
CREATE POLICY "Authenticated can read all profiles for team" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
COMMENT ON POLICY "Authenticated can read all profiles for team" ON public.profiles IS 'Usuários logados podem listar todos os perfis (seleção de responsável no processo, Equipe).';
