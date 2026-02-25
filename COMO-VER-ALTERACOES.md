# Por que NENHUMA alteração aparece?

As alterações estão **só no código da pasta `smart-case-mate`**. Se você abre o sistema por **outro lugar** (link publicado, outra pasta, outro projeto), você **não** está vendo esse código.

---

## Teste rápido: você está no app certo?

1. Abra o **Dashboard** (tela inicial após login).
2. Olhe **abaixo** do texto "Sua central de decisão — tudo sob controle."
3. **Se aparecer** esta linha em destaque:
   - **"✓ Prazos em dias úteis • Atualizações hoje na Inbox"**
   - → Você está no build certo. As outras mudanças (card de prazos no topo, Inbox jurídica etc.) são dessa mesma versão.
4. **Se NÃO aparecer** essa linha:
   - → Você está abrindo **outro** app (deploy antigo ou projeto de outra pasta). Siga os passos abaixo.

---

## Passo a passo para ver as alterações

### A. De onde você está abrindo o sistema hoje?

- **Se é um link na internet** (ex.: algo como `advogado10x.vercel.app` ou link do Lovable):
  - Esse link mostra o **build antigo**. As alterações que fizemos **não** foram publicadas aí.
  - Para ver as mudanças: **rode o app na sua máquina** (passo B) **ou** faça um **novo deploy** a partir da pasta `smart-case-mate`.

- **Se você roda na sua máquina**: qual pasta usa no terminal?
  - Se for **`aios-core-main`** (raiz) ou **`website`** ou qualquer outra que **não** seja **`smart-case-mate`**, o app que abre **não** é o que foi alterado.
  - É obrigatório rodar a partir de **`smart-case-mate`** (passo B).

### B. Rodar o app que tem as alterações

1. Abra o **terminal** (PowerShell ou CMD).
2. Vá **só** na pasta do front que editamos:
   ```bash
   cd c:\Users\empre\Downloads\aios-core-main\smart-case-mate
   ```
3. Suba o servidor:
   ```bash
   npm run dev
   ```
4. No terminal vai aparecer algo como: **Local: http://localhost:5173/**
5. Abra **no navegador** exatamente esse endereço: **http://localhost:5173**
6. Faça login (se precisar).
7. No **Dashboard**, confira:
   - A linha **"✓ Prazos em dias úteis • Atualizações hoje na Inbox"** (logo abaixo do subtítulo).
   - O **primeiro card** da página é **"🔴 Prazos processuais"** (acima de Risco e Ações).
8. Vá em **Inbox** no menu:
   - O título da página deve ser **"Caixa de Entrada Jurídica"**.
   - O subtítulo: *"Novas publicações, andamentos, documentos recebidos e tarefas em um só lugar."*

Se tudo isso aparecer, você está vendo **todas** as alterações. Os valores em R$ 0,00 e “Nenhum honorário” são por falta de dados no Supabase; a interface nova já está aí.

---

## Resumo

| O que você vê | Significado |
|---------------|-------------|
| **Não** aparece "✓ Prazos em dias úteis • Atualizações hoje na Inbox" no Dashboard | Você está em **outro** build (outro projeto ou deploy antigo). Use a pasta `smart-case-mate` e `npm run dev` + localhost:5173. |
| Aparece essa linha e o card "Prazos processuais" no topo | Você está no app **correto**; as alterações estão ativas. |

---

## Se ainda não aparecer

Envie:
1. A **URL** que você usa para abrir o sistema (ex.: `http://localhost:XXXX` ou um link da web).
2. A **pasta** em que você roda `npm run dev` (caminho completo).
3. Uma **captura de tela do Dashboard** (tela inicial após login).

Com isso dá para apontar exatamente o que está errado.
