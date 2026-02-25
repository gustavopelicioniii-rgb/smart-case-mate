# QA Report — Smart Case Mate

**Data:** 25/02/2026 | **Agente:** Quinn (@qa) — Test Architect & Quality Advisor  
**Metodologia:** Code Review + Security Check (8 pontos)

---

## Gate Decision: ⚠️ CONCERNS

O projeto tem boa arquitetura (React + Supabase SDK + shadcn/ui), mas precisa de correções **CRITICAL** e **HIGH** antes de produção.

---

## Resumo Quantitativo

### Code Review

| Severidade | Hooks/Contexts | Pages/Components | Total |
|---|---|---|---|
| CRITICAL | 4 | 6 | **10** |
| HIGH | 10 | 21 | **31** |
| MEDIUM | 14 | 17 | **31** |
| LOW | 8 | 9 | **17** |
| **Total** | **36** | **53** | **89** |

### Security Check (8 pontos)

| # | Ponto | Severidade | Achados |
|---|---|---|---|
| 1 | SQL/NoSQL Injection | ✅ PASS | 0 |
| 2 | XSS | ✅ LOW | 1 (controlado) |
| 3 | **Hardcoded Secrets** | 🔴 CRITICAL | **3** |
| 4 | **Auth/Authorization** | 🔴 HIGH | **2** |
| 5 | **Insecure Data Storage** | 🔴 HIGH | **3** |
| 6 | CSRF/CORS | ⚠️ MEDIUM | 2 |
| 7 | Dependencies | ✅ LOW | 1 |
| 8 | Information Disclosure | ⚠️ MEDIUM | 4 |

**Score de Segurança: 4/10**

---

## TOP 10 — Issues Mais Urgentes

### 🔴 CRITICAL (Bloqueia produção)

| # | Issue | Arquivo | Risco |
|---|---|---|---|
| 1 | `SUPABASE_SERVICE_ROLE_KEY` exposta no `.env` do frontend | `.env` / `.env.local` | Acesso admin total ao banco |
| 2 | Senha hardcoded `'senha123'` para novos usuários | `useTeam.ts:116` | Qualquer pessoa sabe a senha |
| 3 | Senha exibida em toast por 15s | `useTeam.ts:136` | Shoulder surfing |
| 4 | Criação de usuários via client-side com `signUp()` | `useTeam.ts:110-132` | Race condition de sessão |
| 5 | `setState` durante render (fora de useEffect) | `Configuracoes.tsx:35-40` | Loop infinito React |
| 6 | Encoding UTF-8 corrompido em strings | `Configuracoes.tsx` (múltiplas) | UI ilegível |
| 7 | Crash `null.toLowerCase()` na busca | `Documentos.tsx:58-60` | TypeError em runtime |
| 8 | `.sort()` mutando array do useMemo | `Agenda.tsx:213` | Inconsistência visual |
| 9 | Sem `try/catch` no create meeting | `NewMeetingModal.tsx:55-92` | Botão trava permanente |
| 10 | URL fake copiada como link de cobrança real | `Financeiro.tsx:82` | Usuário envia link inválido |

### 🟠 HIGH (Corrigir antes de produção)

| # | Issue | Arquivo |
|---|---|---|
| 1 | API keys WhatsApp expostas no client | `useWhatsApp.ts:159-197` |
| 2 | OAuth Implicit Flow (depreciado) | `useGoogleCalendar.ts:49` |
| 3 | Memory leak no polling de popup OAuth | `useGoogleCalendar.ts:72-92` |
| 4 | Gemini API Key no localStorage | `Configuracoes.tsx:49` |
| 5 | Gemini API Key na URL (query param) | `usePecas.ts:72` |
| 6 | Google token no localStorage sem criptografia | `useGoogleCalendar.ts:61` |
| 7 | Nenhuma rota usa `requiredRole` | `App.tsx` |
| 8 | WhatsApp carrega TODAS mensagens no client | `useWhatsApp.ts:100-134` |
| 9 | Upload sem cleanup em falha (arquivo órfão) | `useDocuments.ts:49-73` |
| 10 | Nenhuma query com paginação | Múltiplos hooks |
| 11 | Dados mock na página de Agenda (produção) | `Agenda.tsx:15` |
| 12 | Selects de pagamento/assinatura sem estado | `Configuracoes.tsx:520-569` |
| 13 | Links Meet falsos gerados com Math.random | `NewMeetingModal.tsx:46-53` |
| 14 | Botão "Excluir" da Inbox sem handler | `Inbox.tsx:121` |
| 15 | Falta `enabled: !!id` na query de processo | `ProcessoDetail.tsx:24` |

---

## Padrões Recorrentes

| Padrão | Ocorrências | Arquivos |
|---|---|---|
| `div` clicável sem `role="button"` / `tabIndex` (a11y) | 7 | Financeiro, Documentos, Inbox, Relatorios, CriticalDeadlines |
| `mutateAsync()` sem `try/catch` | 4 | Documentos, Financeiro, NewMeetingModal |
| Dados mock em produção | 2 | Agenda, NewMeetingModal |
| Falta de `useMemo` em cálculos derivados | 5 | CriticalDeadlines, Relatorios, Financeiro, useDeadlines, useFees |
| `return data as any[]` (perda de type safety) | 3 | useDeadlines, useProcessos |
| `console.error` em produção (info disclosure) | 3 | AuthContext, useGoogleCalendar, CsvImportModal |
| localStorage para dados sensíveis | 3 | useGoogleCalendar, Configuracoes |

---

## Ações Recomendadas por Prioridade

### Imediato (antes de qualquer deploy)
1. Revogar `SUPABASE_SERVICE_ROLE_KEY` e removê-la do frontend
2. Adicionar `.env` ao `.gitignore`
3. Trocar senha hardcoded por geração aleatória
4. Mover criação de usuários para Edge Function
5. Corrigir encoding UTF-8 do `Configuracoes.tsx`
6. Adicionar `try/catch` nos handlers async

### Sprint atual
7. Migrar OAuth para PKCE (Authorization Code + PKCE)
8. Mover API keys (Gemini, WhatsApp) para backend
9. Adicionar `requiredRole` nas rotas admin
10. Substituir dados mock por dados reais do Supabase
11. Implementar paginação nas queries

### Próximo sprint
12. Adicionar `useMemo` nos cálculos derivados
13. Corrigir acessibilidade (role/tabIndex em elementos clicáveis)
14. Implementar service de logging (Sentry) e remover console.error
15. Adicionar staleTime no React Query
16. Gerar tipos Supabase com `supabase gen types`

---

— Quinn, guardião da qualidade 🛡️
