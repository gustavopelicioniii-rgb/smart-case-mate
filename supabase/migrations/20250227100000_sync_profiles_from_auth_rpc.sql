-- RPC para o admin sincronizar contas: cria em public.profiles os usuários de auth.users que ainda não têm perfil.
-- Útil para visualizar quem já tem conta e definir prioridades na Equipe (contas criadas antes do trigger ou por outro meio).
CREATE OR REPLACE FUNCTION public.sync_profiles_from_auth()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  inserted_count integer := 0;
  r record;
BEGIN
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Apenas administradores podem sincronizar contas.';
  END IF;
  FOR r IN
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
  LOOP
    INSERT INTO public.profiles (id, full_name, email, role, updated_at)
    VALUES (
      r.id,
      COALESCE(r.raw_user_meta_data ->> 'full_name', split_part(r.email, '@', 1)),
      r.email,
      COALESCE(NULLIF(TRIM(r.raw_user_meta_data ->> 'role'), ''), 'lawyer'),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    inserted_count := inserted_count + 1;
  END LOOP;
  RETURN inserted_count;
END;
$$;

COMMENT ON FUNCTION public.sync_profiles_from_auth() IS 'Cria perfis em public.profiles para usuários de auth.users que ainda não têm. Apenas admin. Retorna quantos foram criados.';

GRANT EXECUTE ON FUNCTION public.sync_profiles_from_auth() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_profiles_from_auth() TO service_role;
