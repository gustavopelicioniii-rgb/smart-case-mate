-- Campos extras no perfil (Atualize seus dados)
alter table public.profiles add column if not exists profissao text;
alter table public.profiles add column if not exists oab_state text;
alter table public.profiles add column if not exists estado text;
alter table public.profiles add column if not exists endereco text;
alter table public.profiles add column if not exists numero text;
alter table public.profiles add column if not exists cpf text;
alter table public.profiles add column if not exists cep text;
alter table public.profiles add column if not exists cidade text;
alter table public.profiles add column if not exists bairro text;
alter table public.profiles add column if not exists complemento text;
