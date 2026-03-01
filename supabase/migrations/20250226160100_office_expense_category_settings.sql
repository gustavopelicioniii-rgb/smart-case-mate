-- Permite ao usuário alterar o nome e o valor (meta/orçamento) exibidos por categoria no dashboard de gastos
create table if not exists public.office_expense_category_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('luz','agua','assinaturas','outros')),
  display_name text not null,
  budget_value numeric(12,2) default 0,
  unique(owner_id, category)
);

create index if not exists idx_office_expense_category_settings_owner on public.office_expense_category_settings(owner_id);

alter table public.office_expense_category_settings enable row level security;

create policy "Users manage own category settings"
  on public.office_expense_category_settings
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
