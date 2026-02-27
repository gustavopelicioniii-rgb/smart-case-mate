-- Corrige "infinite recursion detected in policy for relation profiles".
-- A política anterior usava EXISTS (SELECT ... FROM profiles), fazendo o Postgres reavaliar a mesma política.
-- Solução: função SECURITY DEFINER que verifica se o usuário é admin (roda fora do RLS).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Retorna true se o usuário atual for admin. Usada nas políticas RLS para evitar recursão.';

DROP POLICY IF EXISTS "Admins read all profiles others read own" ON public.profiles;

CREATE POLICY "Admins read all profiles others read own" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (id = auth.uid() OR public.is_admin())
  );
COMMENT ON POLICY "Admins read all profiles others read own" ON public.profiles IS 'Administradores veem todos os perfis; demais usuários veem apenas o próprio.';
