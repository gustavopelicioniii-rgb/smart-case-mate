# Storage — Bucket `documents` (Supabase)

Este documento descreve o uso do bucket de storage **documents** e as políticas necessárias para o módulo de Documentos e o editor in-app.

## Estrutura de paths

| Prefixo / tipo | Uso |
|----------------|-----|
| *(raiz)* | Arquivos enviados pelo usuário (upload). Ex.: `1730123456789_contrato.docx` |
| `edits/` | Rascunhos de edição em HTML. Um documento Word editado no sistema gera um arquivo em `edits/{file_path}.html`. Ex.: `edits/1730123456789_contrato.docx.html` |

## Políticas necessárias

Para o editor de documentos funcionar (salvamento automático de rascunho e carregamento do rascunho ao reabrir), o bucket **documents** deve permitir:

1. **Upload**  
   - Paths na raiz: upload de novos documentos (já utilizado pelo fluxo de upload).  
   - Paths com prefixo **`edits/`**: upload (e upsert) dos arquivos de rascunho HTML.

2. **Leitura**  
   - Leitura pública (ou autenticada, conforme regra do projeto) dos arquivos na raiz e em **`edits/`**, para:
     - Exibir/baixar o documento original (`getDocumentUrl`).
     - Carregar o rascunho no editor (`getEditedDraftUrl`).

3. **Remoção**  
   - Remoção de arquivos na raiz ao excluir um documento (e, se desejado, remoção de `edits/{filePath}.html` quando o documento for excluído).

## Exemplo de política (Supabase Dashboard)

No Supabase: **Storage** → bucket **documents** → **Policies**.

- **SELECT (leitura):** permitir para usuários autenticados (ou público, se os arquivos forem públicos).
- **INSERT (upload):** permitir para usuários autenticados em qualquer path (incluindo `edits/*`).
- **UPDATE (upsert):** permitir para usuários autenticados em qualquer path (necessário para `upsert: true` nos rascunhos).
- **DELETE:** permitir para usuários autenticados (para exclusão de documentos e, opcionalmente, de rascunhos).

Se o bucket estiver **público** para leitura, as URLs retornadas por `getDocumentUrl` e `getEditedDraftUrl` funcionarão sem autenticação no navegador. Caso o bucket seja privado, será necessário usar URLs assinadas para exibir o documento e o rascunho.

## Referência no código

- Upload de documento: `useDocuments.ts` → `useUploadDocument` (path na raiz).
- Salvamento de rascunho: `useDocuments.ts` → `useSaveEditedDraft` (path `edits/{filePath}.html`).
- URLs: `getDocumentUrl(filePath)` e `getEditedDraftUrl(filePath)`.
