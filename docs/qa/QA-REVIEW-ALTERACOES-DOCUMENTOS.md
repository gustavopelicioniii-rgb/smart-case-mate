# Relatório QA — Alterações recentes (Documentos, Editor, Resiliência)

**Agente:** Quinn (Test Architect & Quality Advisor)  
**Escopo:** smart-case-mate — fluxo de Documentos, editor Word/PDF, normalização de dados e Error Boundary  
**Data:** 2025-02-25

---

## 1. Resumo executivo

Foi feita uma **análise de qualidade** sobre as últimas alterações no módulo de Documentos: editor in-app para Word, visualização de PDF, normalização dos dados da API, proteção contra dados inválidos e isolamento de erro na rota `/documentos`.

**Decisão de gate:** **PASS com CONCERNS** — a solução está consistente e mais resiliente; há pontos de melhoria (tratamento de erro da query, testes, segurança de storage) que não bloqueiam uso em produção, mas devem constar no backlog.

---

## 2. Escopo das alterações analisadas

| Área | Arquivos | Alterações principais |
|------|----------|------------------------|
| Dados / API | `src/hooks/useDocuments.ts` | `normalizeDocument()`, normalização na query, `formatFileSize` defensivo, `useSaveEditedDraft` / `getEditedDraftUrl` |
| UI lista | `src/pages/Documentos.tsx` | `safeDocuments` + filtro defensivo, botão Editar/Visualizar, integração `DocumentEditorModal`, aceite `.docs` |
| Editor | `src/components/documents/DocumentEditorModal.tsx` | Modal PDF (só leitura) + Word (contentEditable + auto-save), aviso PDF, botão "Salvar agora" |
| Resiliência | `src/App.tsx` | `ErrorBoundary` na rota `/documentos` |

---

## 3. Pontos positivos (validados)

- **Normalização de dados (`normalizeDocument`)**: Garante shape segura para cada item retornado pela API; evita crash por `undefined`/`null` ou tipos inesperados. Tipo `unknown` e checagens por campo estão corretos.
- **Proteção na lista**: Uso de `safeDocuments` (array garantido), filtro que descarta itens sem `id` válido e acessos com fallback (`?? ""`, `?? 0`, `?? "Documento"`) reduzem risco de erro em tempo de execução.
- **Modal do editor**: Guard `if (!doc || typeof doc.id !== "string") return null` evita render com documento inválido. `loadWord()` com try/catch e `.catch()` no `useEffect` evita que falhas de rede ou do mammoth derrubem a árvore.
- **`formatFileSize`**: Uso de `Number.isFinite(bytes) && bytes >= 0` evita NaN ou valores negativos.
- **Error Boundary na rota**: Isolamento da rota `/documentos` impede que um erro nessa página derrube o restante do app (menu, outras rotas).
- **UX**: Diferença clara entre PDF (só visualização + link “Abrir em nova aba”) e Word (edição + auto-save + “Salvar agora”). Botão na lista “Editar” vs “Visualizar” conforme tipo de arquivo.

---

## 4. Riscos e concerns (recomendações)

### 4.1 Tratamento de erro da query de documentos (MÉDIO)

- **Onde:** `Documentos.tsx` — `useDocuments()`.
- **Problema:** Não há uso de `isError` nem exibição de mensagem quando a listagem falha (rede, Supabase, etc.). O usuário pode ver lista vazia ou estado de loading sem feedback.
- **Recomendação:** Tratar estado de erro da query, por exemplo:
  - `const { data: documents, isLoading, isError, error } = useDocuments();`
  - Se `isError`, exibir mensagem amigável e opção “Tentar novamente” (ex.: `refetch()`).

### 4.2 Política de storage para `edits/` (MÉDIO)

- **Onde:** Rascunhos em `edits/{filePath}.html` no bucket `documents`.
- **Problema:** Não foi validado no código se o bucket/Supabase permite upload (e leitura) em paths com prefixo `edits/`. Se a política RLS/storage bloquear, o auto-save do rascunho falhará silenciosamente (apenas toast de erro).
- **Recomendação:** Garantir política de storage que permita criar/atualizar/ler em `edits/*` para o mesmo usuário autenticado; documentar no projeto.

### 4.3 Tipo de arquivo `.docs` (BAIXO)

- **Onde:** Aceite de `.docs` no upload e detecção como “Word” no modal.
- **Problema:** Mammoth suporta apenas `.doc`/`.docx`. Arquivos com extensão `.docs` que não forem DOCX por dentro falharão na conversão; o usuário verá a mensagem de erro no modal (comportamento aceitável).
- **Recomendação:** Manter como está; opcionalmente exibir no modal uma dica: “Para edição no sistema, use arquivos .docx.”

### 4.4 Retorno do upload (`useUploadDocument`) (BAIXO)

- **Onde:** `useDocuments.ts` — `insert().select().single()` retorna o documento inserido; esse valor não é usado na UI (a lista vem do refetch após invalidate).
- **Problema:** Se o Supabase retornar um shape inesperado no `.single()`, o código não quebra a UI (não se usa o retorno), mas o TypeScript pode inferir tipo incorreto.
- **Recomendação:** Opcional — tipar o retorno da mutation ou ignorar explicitamente o valor; não é bloqueante.

### 4.5 Acessibilidade do editor (BAIXO)

- **Onde:** `DocumentEditorModal` — `contentEditable` com `prose`.
- **Problema:** Área editável sem `role="textbox"` ou `aria-label` pode ser menos clara para leitores de tela.
- **Recomendação:** Adicionar `role="textbox"` e `aria-label="Conteúdo do documento editável"` (ou equivalente) no `div` contentEditable.

---

## 5. Rastreabilidade e testes

- **Requisitos atendidos (inferidos):**
  - Upload de documentos (PDF, Word, .docs, etc.).
  - Visualização de PDF in-app.
  - Edição de Word in-app com salvamento automático de rascunho (HTML em `edits/`).
  - Evitar tela “Algo deu errado” por dados inesperados ou falha no editor.
- **Cobertura de testes:** Não foi verificada existência de testes unitários ou E2E para:
  - `normalizeDocument`
  - `DocumentEditorModal` (carregar rascunho vs. mammoth, auto-save)
  - Página Documentos (lista, filtro, botões)
- **Recomendação:** Incluir no backlog:
  - Testes unitários para `normalizeDocument` e `formatFileSize`.
  - Teste E2E ou de integração: upload → abrir “Editar” em um .docx → editar texto → verificar que o rascunho é salvo (ou que o toast aparece).

---

## 6. Segurança (checklist rápido)

- **Upload:** Nome do arquivo sanitizado (NFD, remoção de diacríticos, caracteres especiais) — **OK**.
- **Storage:** Uso de Supabase Auth (`getUser()`) antes do insert — **OK**.
- **contentEditable / HTML:** Conteúdo do rascunho é HTML salvo e reexibido; risco de XSS se o HTML for renderizado em outro contexto sem sanitização. No modal atual o HTML é controlado pelo próprio editor; **risco baixo**; para reuso futuro, considerar sanitização (ex.: DOMPurify) ao exibir HTML de terceiros.
- **URLs públicas:** `getDocumentUrl` e `getEditedDraftUrl` usam URLs públicas do bucket; garantir que a política do bucket restrinja acesso conforme regra de negócio.

---

## 7. Conclusão e próximos passos

As alterações **aumentam a robustez** do fluxo de Documentos (normalização, defensivos, Error Boundary) e entregam **edição in-app para Word** com auto-save de rascunho e **visualização de PDF** com aviso claro. Não foram encontrados bloqueadores para uso em produção.

**Próximos passos sugeridos (backlog):**

1. ~~Tratar estado `isError` da query de documentos na página Documentos.~~ **Implementado.**
2. ~~Confirmar e documentar política de storage para `edits/`.~~ **Documentado em `docs/STORAGE-DOCUMENTOS.md`.**
3. Adicionar testes (unit + E2E) para normalização e fluxo de edição.
4. ~~Melhorar acessibilidade do contentEditable (role/aria-label).~~ **Implementado.**

---

## 8. Ajustes implementados (pós-review)

- **Documentos.tsx:** Tratamento de `isError` da query: exibição de mensagem de falha e botão "Tentar novamente" (`refetch()`). Ícones `AlertTriangle` e `RefreshCw`.
- **DocumentEditorModal.tsx:** Área editável com `role="textbox"` e `aria-label="Conteúdo do documento editável"`. Dica opcional: "Para melhor compatibilidade, use arquivos .docx" quando o arquivo não é .doc/.docx.
- **docs/STORAGE-DOCUMENTOS.md:** Documentação da estrutura de paths do bucket `documents` (raiz + `edits/`) e das políticas de storage necessárias no Supabase.

— Quinn, guardião da qualidade
