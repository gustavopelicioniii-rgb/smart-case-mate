# Análise de qualidade — alterações recentes (padrão QA)

Referência: `.cursor/rules/agents/qa.md` (Test Architect & Quality Advisor).  
Escopo: monitoramento Escavador, planos, honorários/despesas, valor da causa vs honorário, resiliência de carregamento.

---

## 1. Rastreabilidade das alterações

| Área | Alteração | Arquivos principais |
|------|-----------|---------------------|
| Monitoramento processos | API Escavador, 1x/dia, palavras-chave, logs, notificações | `process-monitor-cron`, `processMonitor.ts`, `escavador.ts`, migrations, `ProcessMonitorResults`, `dev.md` |
| Planos | Start 40 / Pro 100 / Elite 250, bloqueio de cadastro | `profiles.subscription_plan`, `useProcessos` (useCreateProcesso, useProcessPlanLimit), `ProcessoModal`, `Processos.tsx` |
| Honorários | Forma de pagamento (à vista, entrada+parcelas, cartão) | `fees` migration, `FeeModal`, `useFees`, types |
| Despesas escritório | Dashboard Luz/Água/Assinaturas/Outros, CRUD, edição | `office_expenses` migration, `useExpenses`, `ExpenseModal`, `Financeiro.tsx` |
| Valor da causa vs honorário | Diferenciação em labels e textos de ajuda | `Processos.tsx`, `ProcessoDetail`, `ProcessoModal`, `Financeiro.tsx`, `FeeModal`, `dev.md` |
| Resiliência | App não quebra se migrations/colunas faltando | `useProcessMonitorLogs`, `useFees`, `useProcessos`, `useExpenses`, tipos opcionais |

---

## 2. Migrations (schema e RLS)

**Pontos positivos**

- Uso de `ADD COLUMN IF NOT EXISTS` e `CREATE TABLE IF NOT EXISTS`: migrations idempotentes.
- `COMMENT ON COLUMN/TABLE`: documentação no banco.
- Índices criados onde faz sentido (`process_id`, `owner_id`, `category`, `due_date`, `created_at`).
- RLS habilitado em todas as tabelas novas; políticas nomeadas e explícitas.
- `process_monitor_logs`: SELECT restrito a `owner_id = auth.uid()`.
- `office_expenses`: INSERT/UPDATE/DELETE exigem `auth.uid() IS NOT NULL` (e políticas de UPDATE/DELETE com `USING`).

**Pontos de atenção**

- **process_movements:** política `"Users can view process_movements" FOR SELECT USING (true)` — qualquer usuário autenticado vê todas as movimentações. Em multi-tenant, o ideal é restringir por `owner_id` (ex.: `owner_id = auth.uid()` ou política por escritório).
- **office_expenses:** `SELECT USING (true)` — todos veem todas as despesas. Aceitável se o escritório for único; em multi-tenant, considerar filtrar por `owner_id`.
- **office_expenses:** `CREATE OR REPLACE FUNCTION update_updated_at()` — a função pode já existir noutra migration; usar `CREATE OR REPLACE` evita erro e mantém idempotência.

**Recomendações**

- Se o produto for multi-tenant, ajustar RLS de `process_movements` e `office_expenses` para filtrar por `owner_id` (ou por tenant/escritório, se existir).
- Manter padrão: novas tabelas com RLS + políticas com comentário explicando o critério (ex.: “apenas próprio owner”).

---

## 3. Segurança

- **Token Escavador:** usado apenas na Edge Function; não exposto no front (bom).
- **Edge Function:** uso de `SUPABASE_SERVICE_ROLE_KEY` apenas no backend (correto).
- **RLS:** já comentado acima; único ponto fraco é SELECT amplo em `process_movements` e `office_expenses` se houver multi-tenant.
- **Dados sensíveis:** nenhum dado sensível (ex.: senha, token) em logs ou respostas de API no código revisado.

---

## 4. Resiliência e tratamento de erro

**Pontos positivos**

- `useProcessMonitorLogs`: em erro da API (ex.: tabela inexistente), retorna `[]` em vez de lançar — evita tela quebrada.
- `useExpenses`: idem, retorna `[]` em caso de erro.
- Tipos TypeScript: `Fee` e `Processo` com campos opcionais (`payment_method?`, `last_checked_at?`, etc.) para compatibilidade com banco antigo.
- `useProcessPlanLimit`: usa `useProfile()` (select `*`) em vez de depender de coluna `subscription_plan` isolada; `getPlanProcessLimit(undefined)` cai no default 40.
- `useCreateProcesso`: verificação de limite do plano em try/catch para não quebrar se `subscription_plan` não existir; fallback para checagem só de count.

**Sugestão**

- Manter padrão em novos hooks que leem tabelas opcionais ou colunas novas: em falha de query, retornar valor seguro (ex.: `[]`, `null`) e logar em dev, em vez de propagar erro e quebrar a UI.

---

## 5. Consistência e UX (valor da causa vs honorário)

- **Processos:** “Valor da causa” em tabela, tooltip, detalhe e modal; texto de ajuda no modal explicando que honorários ficam no Financeiro.
- **Financeiro:** “Valor do honorário” em tabelas (Honorários e Por Processo) e no modal; texto de ajuda explicando diferença em relação ao valor da causa.
- **Página Financeiro:** texto no topo deixando explícito que “valor da causa” e “valor dos honorários” são conceitos diferentes e onde cada um fica.
- **dev.md:** regra explícita para nunca usar só “Valor” onde houver ambiguidade.

Padrão de qualidade: atendido (rótulos e textos consistentes e sem ambiguidade).

---

## 6. Edge Function (process-monitor-cron)

- Verificação de `ESCAVADOR_API_TOKEN` antes de processar; resposta 500 com mensagem clara se faltar.
- Tratamento de erro da API Escavador (body de erro, status HTTP).
- Logs em `process_monitor_logs` (consulta_realizada, atualizacao_encontrada, erro_api).
- Notificações via `inbox_items` e atualização de `processos.last_checked_at`.
- Regra de 24h implementada com `shouldCheckProcess(last_checked_at)`.
- Normalização de número CNJ e filtro por palavras-chave alinhados à regra de negócio.

**Sugestão**

- Em ambiente de produção, considerar log estruturado (ex.: nível, process_id, erro) para facilitar monitoramento e alertas.

---

## 7. Tipos e contratos (TypeScript / Supabase)

- `Database` em `types.ts` atualizado com `process_movements`, `process_monitor_logs`, `office_expenses`, `profiles.subscription_plan`, `processos.last_checked_at`, `fees.payment_method`, `entrada_value`, `installments`.
- Interfaces de front (`Fee`, `Processo`, `OfficeExpense`, etc.) alinhadas aos tipos do banco, com opcionais onde o schema pode ainda não estar aplicado.
- Sem erros de lint nos arquivos alterados (Financeiro, useExpenses, useProcessos).

---

## 8. Padrão de qualidade — resumo

| Critério | Status | Observação |
|----------|--------|------------|
| Migrations idempotentes | ✅ | IF NOT EXISTS / CREATE OR REPLACE |
| RLS em tabelas novas | ✅ | Políticas definidas; 2 SELECT amplos (ver seção 2) |
| Segurança (tokens, RLS) | ✅ | Token só no backend; RLS revisado |
| Resiliência (falhas de API/banco) | ✅ | Retorno seguro e tipos tolerantes |
| Diferenciação valor da causa / honorário | ✅ | Labels e textos consistentes |
| Documentação (dev.md, comentários) | ✅ | Regras e comentários no código/SQL |
| Tipos e lint | ✅ | Tipos atualizados; sem erros nos arquivos revisados |

**Recomendações prioritárias (implementadas)**

1. **RLS (multi-tenant):** ✅ Migration `20250225230000_rls_multi_tenant.sql` criada: SELECT em `process_movements` e `office_expenses` restrito a `owner_id = auth.uid()`; UPDATE/DELETE em `office_expenses` também restritos ao próprio owner.
2. **Padrão de resiliência:** ✅ Documentado em `dev.md` (seção 11): retornar valor seguro em falha de query; exemplos e regra para novos hooks.
3. **Logs da Edge Function:** ✅ `process-monitor-cron`: helper `logStructured(level, message, meta)` com nível, `process_id`, `process_number`, mensagem e timestamp em JSON; usado em início, fim, erro de API, consulta realizada e atualização encontrada.

Com essas considerações, as alterações estão alinhadas ao padrão de qualidade esperado (QA advisory) e as melhorias sugeridas foram aplicadas.
