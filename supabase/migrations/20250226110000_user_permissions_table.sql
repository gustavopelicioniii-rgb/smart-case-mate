-- Tabela de permissões por módulo (limitar o que cada usuário pode ver/editar).
-- O administrador define na página Equipe; usuários sem permissão para um módulo não veem o menu nem acessam a rota.
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, module)
);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions(user_id);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own permissions" ON public.user_permissions;
CREATE POLICY "Users read own permissions" ON public.user_permissions
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "Admins manage all permissions" ON public.user_permissions;
CREATE POLICY "Admins manage all permissions" ON public.user_permissions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
COMMENT ON TABLE public.user_permissions IS 'Permissões por módulo (ver/editar). Admin define na Equipe; usuários limitados só veem o que tiver can_view.';
