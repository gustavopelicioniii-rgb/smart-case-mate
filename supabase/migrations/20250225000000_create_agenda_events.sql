-- Tabela de eventos da agenda local (reuniões agendadas no sistema)
create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid references auth.users(id) on delete set null,
  titulo text not null,
  tipo text not null default 'reuniao',
  data date not null,
  hora_inicio text not null,
  hora_fim text not null,
  participantes text,
  cliente_id uuid,
  processo_id uuid,
  cliente_nome text,
  processo_numero text,
  link text,
  status text not null default 'agendada'
);

-- Índices para filtros comuns
create index if not exists idx_agenda_events_owner_data on public.agenda_events(owner_id, data);
create index if not exists idx_agenda_events_data on public.agenda_events(data);

-- RLS: usuário vê apenas seus próprios eventos
alter table public.agenda_events enable row level security;

drop policy if exists "Users can manage own agenda events" on public.agenda_events;
create policy "Users can manage own agenda events"
  on public.agenda_events
  for all
  using (auth.uid() = owner_id or owner_id is null)
  with check (auth.uid() = owner_id or owner_id is null);
