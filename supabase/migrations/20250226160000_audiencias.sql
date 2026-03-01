-- Tabela de audiências por processo (evita erro "Could not find the table 'public.audiencias'")
create table if not exists public.audiencias (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.processos(id) on delete cascade,
  data timestamptz not null,
  tipo text not null,
  local text,
  link_meet text,
  status text not null default 'Agendada',
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_audiencias_process_id on public.audiencias(process_id);
create index if not exists idx_audiencias_owner_id on public.audiencias(owner_id);

-- RLS: usuário vê/edita apenas audiências dos próprios processos (owner do processo)
alter table public.audiencias enable row level security;

create policy "Users can view audiencias of own processes"
  on public.audiencias for select
  to authenticated
  using (
    exists (
      select 1 from public.processos p
      where p.id = audiencias.process_id and p.owner_id = auth.uid()
    )
  );

create policy "Users can insert audiencias for own processes"
  on public.audiencias for insert
  to authenticated
  with check (
    exists (
      select 1 from public.processos p
      where p.id = audiencias.process_id and p.owner_id = auth.uid()
    )
  );

create policy "Users can update own audiencias"
  on public.audiencias for update
  to authenticated
  using (
    exists (
      select 1 from public.processos p
      where p.id = audiencias.process_id and p.owner_id = auth.uid()
    )
  );

create policy "Users can delete own audiencias"
  on public.audiencias for delete
  to authenticated
  using (
    exists (
      select 1 from public.processos p
      where p.id = audiencias.process_id and p.owner_id = auth.uid()
    )
  );

-- Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists audiencias_updated_at on public.audiencias;
create trigger audiencias_updated_at
  before update on public.audiencias
  for each row execute function public.set_updated_at();
