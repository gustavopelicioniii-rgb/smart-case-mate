-- Logo do escritório: URL da imagem no perfil (upload via Storage, URL salva aqui)
alter table public.profiles
  add column if not exists firm_logo_url text;

comment on column public.profiles.firm_logo_url is 'URL pública da logo do escritório (ex.: Supabase Storage).';
