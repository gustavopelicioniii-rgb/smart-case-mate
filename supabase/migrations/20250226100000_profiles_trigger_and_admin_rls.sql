-- 1) Trigger: criar perfil em public.profiles sempre que um novo usuário for criado em auth.users
-- Assim, quando o convidado confirmar o e-mail e entrar no sistema, o perfil já existirá e aparecerá na Equipe do admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'role'), ''), 'lawyer'),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria ou atualiza perfil em public.profiles quando um usuário é criado em auth.users (convite ou cadastro).';

-- 2) RLS: apenas administradores veem todos os perfis; outros veem só o próprio (para Equipe do admin listar todos)
DROP POLICY IF EXISTS "Authenticated can read all profiles for team" ON public.profiles;
CREATE POLICY "Admins read all profiles others read own" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    )
  );
COMMENT ON POLICY "Admins read all profiles others read own" ON public.profiles IS 'Administradores veem todos os perfis (Equipe); demais usuários veem apenas o próprio.';
