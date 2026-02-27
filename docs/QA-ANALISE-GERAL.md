# Análise QA — Smart Case Mate (todos os arquivos)

Referência: agente QA (Test Architect & Quality Advisor).  
Escopo: análise geral do projeto **smart-case-mate** — estrutura, migrations, segurança, resiliência, consistência e fluxos críticos.

---

## 1. Estrutura e rastreabilidade

### 1.1 Organização do código

| Camada | Pasta / arquivos | Observação |
|--------|------------------|------------|
| Entrada | `main.tsx`, `App.tsx` | QueryClient global, AuthProvider, rotas protegidas, ConfigNeededScreen em produção |
| Rotas | `App.tsx` | Login público; Dashboard, Processos, Agenda, etc. sob ProtectedRoute; Relatórios e Equipe com `requiredRole="admin"`; Documentos com ErrorBoundary |
| Layout | `AppLayout.tsx`, `AppSidebar.tsx`, `MobileHeader.tsx`, `MobileBottomNav.tsx` | Sidebar filtra itens por `useMyPermissions()` (módulo); Equipe só para admin; PermissionRedirect no main |
| Contexto | `AuthContext.tsx` | Session, user, role (admin/lawyer), loading; role vindo de `profiles`; fetchUserRole com ref para evitar race |
| Páginas | `src/pages/*.tsx` | Uma página por rota; Calculadora com subrotas (Calculadora, CorrecaoValores, MeusCalculos) |
| Hooks | `src/hooks/*.ts` | useProfile, useTeam (useMyPermissions, useTeamMembers), useProcessos, useFees, useExpenses, useAgendaEvents, useCrm, useDocuments, etc. |
| Integração | `integrations/supabase/client.ts`, `types.ts` | Cliente único; tipos Database alinhados às tabelas e migrations |
| Supabase | `supabase/migrations/*.sql`, `supabase/functions/*` | 14 migrations ordenadas por data; Edge Functions: calculadora-correcao, process-monitor-cron, whatsapp-webhook |

### 1.2 Rastreabilidade por funcionalidade

| Funcionalidade | Arquivos principais |
|----------------|---------------------|
| Autenticação e perfil | AuthContext, ProtectedRoute, Login, useProfile, profiles (migrations 20250226100000, 20250226120000, 20250226140000) |
| Logo do escritório | useProfile (useUploadFirmLogo, useRemoveFirmLogo), Configuracoes, storage policies 20250226130000 |
| Equipe e permissões | Equipe, useTeam (useTeamMembers, useMyPermissions), user_permissions 20250226110000, PermissionRedirect, AppSidebar |
| Calculadora Jurídica | Calculadora, CorrecaoValores, MeusCalculos, calculadora-correcao (Edge), 20250225260000_calculadora_juridica |
| Processos e monitoramento | Processos, ProcessoDetail, useProcessos, process-monitor-cron, processMonitor, escavador, migrations 20250225200000, 20250225230000 |
| Financeiro | Financeiro, useFees, useExpenses, FeeModal, ExpenseModal, migrations 20250225210000, 20250225220000, 20250225230000 |
| Agenda | Agenda, useAgendaEvents, NewMeetingModal, 20250225000000_create_agenda_events |
| Documentos/Processo | ProcessoDetail (docs, notas), process_documents, process_notes, 20250225250000, Storage bucket documents |

---

## 2. Migrations e RLS

### 2.1 Lista de migrations (ordem cronológica)

| Migration | Objetivo |
|-----------|----------|
| 20250225000000_create_agenda_events | Tabela agenda_events, RLS |
| 20250225100000_add_firm_logo_to_profiles | Coluna firm_logo_url em profiles |
| 20250225200000_process_monitor_plans_and_movements | last_checked_at, subscription_plan, process_movements, process_monitor_logs, RLS |
| 20250225210000_fees_payment_method | payment_method, entrada_value, installments em fees |
| 20250225220000_office_expenses | Tabela office_expenses, RLS (posteriormente restrito por 20250225230000) |
| 20250225230000_rls_multi_tenant | process_movements e office_expenses por owner_id |
| 20250225240000_profiles_read_all_for_team | RLS em profiles (substituído por 20250226100000) |
| 20250225250000_process_notes_and_documents | process_notes, process_documents, RLS |
| 20250225260000_calculadora_juridica | calculos, indices_oficiais, calculo_logs, RLS |
| 20250226100000_profiles_trigger_and_admin_rls | handle_new_user(), política SELECT profiles (admin vê todos) — causa recursão sem 20250226140000 |
| 20250226110000_user_permissions_table | user_permissions, RLS (admin gerencia, usuário lê próprias) |
| 20250226120000_profiles_update_own | Política UPDATE em profiles (id = auth.uid()) |
| 20250226130000_storage_logos_policy | Políticas Storage bucket documents, pasta logos/<user_id>/ |
| 20250226140000_profiles_rls_no_recursion | is_admin() SECURITY DEFINER, política SELECT sem recursão |

### 2.2 Pontos positivos

- Uso de `IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`: migrations idempotentes.
- Comentários em tabelas/colunas e políticas.
- RLS habilitado nas tabelas sensíveis; políticas nomeadas.
- Multi-tenant consistente: owner_id = auth.uid() em process_movements, office_expenses, calculos, process_notes, process_documents, etc.
- Função is_admin() evita recursão na política de profiles; user_permissions usa EXISTS em profiles (sem recursão porque is_admin não reentra RLS).

### 2.3 Pontos de atenção

- **Ordem de aplicação:** 20250226140000 deve ser aplicada após 20250226100000 no mesmo projeto; 20250226120000 necessária para salvar firm_logo_url.
- **Bucket documents:** não é criado por migration; deve existir no Storage (criado manualmente ou por outro meio); políticas 20250226130000 referem-se a ele.
- **processos:** calculos tem FK para processos; se processos não existir no ambiente, a migration da calculadora pode falhar (comum em projetos que já têm processos).

---

## 3. Segurança

### 3.1 Autenticação e autorização

- **Login:** Supabase Auth; redirecionamento para rota de origem após login.
- **ProtectedRoute:** exige user; requiredRole (admin/lawyer) com fallback para "/"; admin sempre permitido quando requiredRole é lawyer.
- **Role:** obtida de profiles.role; valores válidos admin | lawyer; falha na leitura do role resulta em role null (usuário não acessa rotas que exigem role).
- **Permissões por módulo:** user_permissions (can_view, can_edit); AppSidebar filtra itens por useMyPermissions(); PermissionRedirect redireciona quando não tem can_view para o módulo da rota atual.

### 3.2 Tokens e dados sensíveis

- **Frontend:** apenas VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (públicas); session.access_token usado pelo cliente Supabase.
- **Edge Functions:** SUPABASE_SERVICE_ROLE_KEY e SUPABASE_URL apenas no servidor; calculadora-correcao e process-monitor-cron não expõem chave.
- **Escavador:** token apenas na Edge Function (process-monitor-cron) ou secrets; não no front.

### 3.3 RLS e Storage

- **profiles:** SELECT com is_admin() ou id = auth.uid(); UPDATE com id = auth.uid() (20250226120000).
- **Storage logos:** INSERT/SELECT/UPDATE/DELETE em storage.objects restritos a bucket documents, pasta logos e (storage.foldername(name))[2] = auth.uid()::text.
- **user_permissions:** SELECT próprio ou admin; ALL para admin (gerenciar permissões).

---

## 4. Resiliência e tratamento de erros

### 4.1 Padrões observados

- **Config em produção:** App.tsx exibe ConfigNeededScreen quando isSupabaseConfigured é false em PROD (evita tela branca por falta de variáveis).
- **ErrorBoundary:** usado apenas em Documentos; exibe "Algo deu errado" com detalhes e botão recarregar; log em console.
- **Hooks que leem tabelas opcionais:** useProcessMonitorLogs, useExpenses e similares retornam [] ou valor seguro em erro (evita quebra de UI).
- **Tipos:** campos opcionais (payment_method?, last_checked_at?, etc.) para compatibilidade com banco sem migration aplicada.
- **Calculadora:** refreshSession antes de invoke; retry automático em erro 401/unauthorized/rede; mensagens específicas para 401, rede/CORS e erro genérico.
- **Logo:** mensagens diferenciadas para erro de Storage (bucket/políticas) e para erro ao atualizar perfil (recursão → 20250226140000; RLS → 20250226120000).

### 4.2 Onde há throw / onError

- Vários hooks e páginas usam throw new Error ou onError de mutation; toasts (sonner ou useToast) para feedback.
- AuthContext: fetchUserRole em catch seta role null e loading false; não propaga erro.
- Nenhum TODO/FIXME/HACK encontrado no src (grep).

### 4.3 Recomendações

- Manter padrão: hooks que dependem de tabelas/colunas opcionais retornam valor seguro em erro.
- Considerar ErrorBoundary em mais rotas críticas (ex.: Calculadora, Configurações) se quiser isolar falhas de render.
- Edge Function calculadora-correcao: já retorna JSON com CORS em erros; opcional tratar "relation does not exist" com mensagem orientando rodar migration.

---

## 5. Consistência (nomenclatura, tipos, UX)

### 5.1 Nomenclatura

- Rotas em minúsculas, kebab quando composto: /calculadora/correcao, /meus-calculos, /processos/:id.
- Módulos no menu e em user_permissions: processos, agenda, pecas, crm, financeiro, documentos, publicacoes, relatorios, configuracoes.
- Labels: "Valor da causa" em Processos; "Valor do honorário" em Financeiro (conforme dev.md).

### 5.2 Tipos (TypeScript / Supabase)

- Database em types.ts cobre profiles, processos, process_movements, process_monitor_logs, deadlines, fees, office_expenses, agenda_events, calculos, indices_oficiais, calculo_logs, user_permissions, process_notes, process_documents, etc.
- Interfaces de página/hook alinhadas aos Row/Insert/Update ou estendidas com opcionais.
- types/calculadora.ts: CorrecaoValoresParametros, CorrecaoValoresResult e relacionados.

### 5.3 Acessibilidade e UX

- Link "Pular para o conteúdo" no AppLayout.
- main com id="main-content" e tabIndex={-1}.
- Sidebar com ícones e labels; contagem na Agenda; badge no Gerador de Peças.

---

## 6. Fluxos críticos (resumo)

| Fluxo | Condições de sucesso | Possíveis falhas e mitigação |
|-------|----------------------|------------------------------|
| Login | Supabase configurado; Auth; profiles com role | Role null → usuário não acessa rotas por role; trigger handle_new_user cria perfil ao signup |
| Upload logo | Bucket documents existe; políticas Storage 20250226130000; política UPDATE profiles 20250226120000; sem recursão 20250226140000 | Mensagens de erro indicam migration a aplicar (CHECKLIST-LOGO-E-CALCULADORA.md) |
| Calculadora (Correção de Valores) | Tabelas 20250225260000; Edge Function publicada; VITE_SUPABASE_URL do mesmo projeto; sessão válida | refreshSession + retry; toasts específicos; checklist no DEPLOY e CHECKLIST-LOGO-E-CALCULADORA |
| Equipe (admin) | user_permissions 20250226110000; profiles SELECT com is_admin 20250226140000 | Admin vê todos; outros não acessam /equipe (ProtectedRoute requiredRole="admin") |
| Processos / Financeiro / Despesas | RLS multi-tenant 20250225230000; owner_id em inserts | Cada usuário vê apenas seus dados |

---

## 7. Riscos e recomendações consolidadas

### 7.1 Riscos

| Risco | Mitigação atual |
|-------|------------------|
| Migrations fora de ordem ou não aplicadas | DEPLOY-VERCEL.md e CHECKLIST-LOGO-E-CALCULADORA.md com ordem e nomes das migrations |
| Recursão em profiles | 20250226140000_profiles_rls_no_recursion.sql com is_admin() |
| 401 na Calculadora | supabase.functions.invoke + refreshSession + retry; mensagens claras |
| Bucket documents inexistente | Documentação: criar bucket manualmente; políticas assumem que existe |

### 7.2 Recomendações prioritárias

1. **Ambiente novo:** aplicar migrations na ordem listada na seção 2.1; criar bucket documents se usar logo.
2. **Manter:** padrão de valor seguro em hooks ([]/null em erro); mensagens de erro que indiquem migration ou passo (logo e calculadora).
3. **Opcional:** preencher hash_integridade ao inserir em calculos (já existente no schema); incluir versao_formula no retorno da Edge Function calculadora-correcao (já usado no insert).
4. **Opcional:** ErrorBoundary em mais rotas; na Edge Function, tratar "relation does not exist" com mensagem para rodar migration.

---

## 8. Documentação e referências

- **DEPLOY-VERCEL.md:** variáveis, migrations por funcionalidade, checklist logo/calculadora, infinite recursion, tela branca, Failed to fetch.
- **CHECKLIST-LOGO-E-CALCULADORA.md:** tabelas para logo (bucket, coluna, políticas, recursão) e calculadora (tabelas, Edge Function, URL, sessão).
- **docs/QA-REVIEW-CALCULADORA-JURIDICA.md:** análise detalhada do módulo Calculadora (RLS, segurança, resiliência, juros compostos, versao_formula).
- **docs/QA-REVIEW-ALTERACOES-RECENTES.md:** monitoramento Escavador, planos, honorários/despesas, RLS multi-tenant, resiliência.

---

## 9. Conclusão

O projeto está organizado por rotas, hooks e integração Supabase bem definidos. As migrations são idempotentes e o RLS está aplicado de forma consistente (multi-tenant e perfis/admin). Os fluxos críticos (login, logo, calculadora, equipe) têm tratamento de erro e documentação (DEPLOY, CHECKLIST) para diagnóstico. As melhorias recentes (is_admin, retry calculadora, mensagens de erro da logo) reduzem recursão e 401. Recomenda-se manter o padrão de resiliência nos hooks e aplicar as migrations na ordem indicada em novos ambientes.
