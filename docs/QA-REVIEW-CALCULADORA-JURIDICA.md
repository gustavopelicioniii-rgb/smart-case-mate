# Análise QA — Calculadora Jurídica Estratégica

Escopo: módulo Calculadora Jurídica (listagem, Correção de Valores, Meus Cálculos), migration, Edge Function, integração com Supabase.

---

## 1. Rastreabilidade

| Área | Alteração | Arquivos principais |
|------|-----------|---------------------|
| Calculadora | Listagem de módulos, rota, menu | `Calculadora.tsx`, `App.tsx`, `AppSidebar.tsx`, `MobileMenu.tsx` |
| Correção de Valores | Formulário, chamada Edge Function (fetch), resultado, export CSV, persistência em `calculos` | `CorrecaoValores.tsx`, `supabase/functions/calculadora-correcao/index.ts` |
| Meus Cálculos | Histórico de cálculos por usuário | `MeusCalculos.tsx` |
| Banco | Tabelas calculos, indices_oficiais, calculo_logs, RLS | `20250225260000_calculadora_juridica.sql` |
| Tipos | calculos, indices_oficiais, calculo_logs | `integrations/supabase/types.ts` |

---

## 2. Migrations e RLS

**Pontos positivos**

- `CREATE TABLE IF NOT EXISTS` e índices em colunas usadas em filtros (`owner_id`, `tipo_calculo`, `created_at`, `indice, referencia`).
- RLS em todas as tabelas; políticas explícitas por `owner_id` em `calculos`; `indices_oficiais` apenas SELECT para autenticados; `calculo_logs` vinculado ao dono do cálculo.
- INSERT em `calculos` exige `owner_id = auth.uid()`.
- Comentários nas tabelas.

**Pontos de atenção**

- **processo_id em calculos:** FK para `public.processos(id)`. Se a migration rodar em ambiente onde `processos` ainda não existe, a criação de `calculos` falha. Em projetos que já têm `processos`, está ok.
- **hash_integridade:** Coluna presente no schema mas nunca preenchida no código. Útil para auditoria (ex.: hash de parametros_json + resultado_json).

**Recomendações**

- Manter padrão de RLS em futuros módulos da calculadora.
- Opcional: preencher `hash_integridade` ao salvar cálculo (ex.: hash simples de JSON stringificado).

---

## 3. Segurança

- **Edge Function:** usa `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor; token nunca no front.
- **Chamada ao backend:** front usa `fetch` com `Authorization: Bearer` (session ou anon key); evita CORS com header `x-client-info`.
- **RLS:** usuário só acessa próprios cálculos e logs; índices são somente leitura para autenticados.
- **Dados sensíveis:** nenhum token ou dado sensível em logs ou respostas.

**Sugestão**

- Se `session` e `VITE_SUPABASE_ANON_KEY` forem vazios, não enviar requisição; exibir mensagem clara (ex.: "Configure o acesso ao Supabase").

---

## 4. Resiliência e tratamento de erro

**Pontos positivos**

- **MeusCalculos:** `queryFn` com try/catch retorna `[]` em erro (tabela inexistente ou RLS); não quebra a UI.
- **CorrecaoValores:** resultado do cálculo é exibido mesmo se o insert em `calculos` falhar; toast diferencia "Cálculo realizado e salvo" de "Cálculo salvo, mas falha ao registrar".
- **Edge Function:** try/catch em volta da lógica principal; resposta 500 com mensagem em JSON e CORS.
- Validação de datas e valor inicial no front antes de chamar a função.

**Pontos de atenção**

- **Insert em calculos:** se a tabela não existir, o insert falha e o usuário vê toast de falha ao registrar; o resultado continua na tela. Aceitável; para maior resiliência, poderia envolver apenas o insert em try/catch interno e não propagar.
- **Edge Function:** se `indices_oficiais` não existir, a query pode lançar; o catch atual devolve 500. Poderia tratar erro de "relation does not exist" e retornar mensagem específica (ex.: "Execute a migration da calculadora no SQL Editor").

**Recomendações**

- Manter padrão: hooks que leem tabelas opcionais retornam valor seguro (`[]`, `null`) em erro.
- Opcional: na Edge Function, tratar erro de tabela inexistente e retornar 503 com mensagem orientando a rodar a migration.

---

## 5. Consistência e UX

- Nomenclatura: "Calculadora Jurídica" no menu; "Correção de Valores" e "Meus Cálculos" nas páginas; alinhado ao dev.md §14.
- Formulário com labels obrigatórios (*), placeholders e texto de ajuda implícito (descrição da página).
- Export CSV com BOM (`\uFEFF`) para Excel abrir com encoding correto.
- **Meus Cálculos:** clique no card leva para `/calculadora/correcao` mas não reabre o cálculo selecionado (não há tela de detalhe nem preenchimento do formulário a partir do histórico).

**Sugestões**

- Melhoria futura: ao clicar em um item em Meus Cálculos, abrir detalhe do cálculo (só leitura) ou redirecionar para Correção de Valores com parâmetros preenchidos (query params ou state).
- Exibir texto de ajuda no campo "Percentual mensal" (ex.: "Deixe vazio para usar 1% a.m. ou SELIC conforme o tipo de juros").

---

## 6. Edge Function (calculadora-correcao)

- OPTIONS tratado no início (CORS preflight).
- Validação de body (valorInicial, datas, indice, tipoJuros); datas em formato ISO ou YYYY-MM-DD.
- Leitura de `indices_oficiais` para correção; fallback 0,5% ao mês quando não há índice.
- Juros: hoje simples e compostos usam a mesma fórmula (taxa mensal sobre valor após correção). O spec pede diferença entre simples e compostos; para precisão jurídica, compostos devem acumular mês a mês (juros sobre valor já corrigido + juros anteriores).
- Resposta estruturada: timeline, valorFinal, memoriaDetalhada, tabelaExportavel.
- CORS em todas as respostas (sucesso e erro).

**Recomendações**

- **Precisão:** implementar juros compostos de fato (valor atualizado = valor anterior × (1 + taxa) a cada mês) e manter juros simples como aplicação da taxa apenas sobre o valor do mês atual.
- **Versão da fórmula:** incluir no resultado um campo `versao_formula` (ex.: 1) para reprocessamento futuro (dev.md §14).
- Opcional: log em `calculo_logs` a partir da Edge Function quando houver um `calculo_id` passado no body (fluxo futuro de reprocessamento).

---

## 7. Tipos e contratos

- `types.ts`: `calculos`, `indices_oficiais`, `calculo_logs` com Row/Insert/Update; `parametros_json` e `resultado_json` como `Record<string, unknown>`.
- `indices_oficiais.referencia`: no banco é DATE; no TypeScript está como `string` (Supabase serializa date como string) — correto.
- Frontend: tipo do estado `resultado` em CorrecaoValores alinhado ao retorno da função (timeline, memoriaDetalhada, valorFinal).

**Sugestão**

- Exportar tipo compartilhado para o resultado da correção (ex.: `CorrecaoValoresResult`) em um arquivo de tipos da calculadora, para reuso em Meus Cálculos e possível tela de detalhe.

---

## 8. Melhorias implementáveis (resumo)

| Prioridade | Melhoria |
|------------|----------|
| Alta | Garantir token (session ou anon) antes de chamar a Edge Function; mensagem clara se estiver vazio. |
| Alta | Inserir registro em `calculo_logs` ao salvar um novo cálculo (evento "criacao" ou "calculo_realizado"). |
| Média | Implementar juros compostos corretamente na Edge Function (acumulação mês a mês). |
| Média | Incluir `versao_formula` no JSON de resultado retornado pela função. |
| Baixa | Preencher `hash_integridade` ao inserir em `calculos` (hash do payload para auditoria). |
| Baixa | Meus Cálculos: link para detalhe ou para Correção com parâmetros preenchidos (futuro). |
| Baixa | Tipo compartilhado para resultado da correção (evitar duplicação de interface). |

---

## 9. Conclusão

O módulo Calculadora Jurídica está alinhado ao spec (dev.md §14) na estrutura (tabelas, RLS, listagem, primeiro módulo Correção de Valores, cálculo no servidor). As melhorias sugeridas aumentam auditoria (logs, hash), precisão (juros compostos), resiliência (token vazio, mensagens de erro) e preparação para reprocessamento (versao_formula). Recomenda-se aplicar as de prioridade alta e média na próxima iteração.
