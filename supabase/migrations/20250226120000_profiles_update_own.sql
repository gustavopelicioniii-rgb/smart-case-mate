-- Permite que cada usuário atualize o próprio perfil (ex.: firm_logo_url nas Configurações).
-- Sem esta política, "Erro ao enviar logo" com "new row violates row-level security policy".
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 'Usuário pode atualizar apenas o próprio perfil (logo, nome, etc.).';
