# Deploy na Vercel

O projeto está pronto para subir na Vercel. Siga os passos abaixo.

## 1. Conta e repositório

- Crie uma conta em [vercel.com](https://vercel.com) (ou use GitHub/GitLab).
- Envie o código do **smart-case-mate** para um repositório Git (GitHub, GitLab ou Bitbucket). A Vercel importa o projeto a partir desse repositório.

## 2. Novo projeto na Vercel

1. No dashboard da Vercel, clique em **Add New** → **Project**.
2. Importe o repositório onde está o **smart-case-mate**.
3. **Root Directory:** se o app não estiver na raiz do repositório, defina a pasta do projeto (ex.: `smart-case-mate`).
4. **Framework Preset:** a Vercel costuma detectar **Vite** automaticamente. Se não aparecer, escolha **Vite**.
5. **Build Command:** `npm run build` (padrão).
6. **Output Directory:** `dist` (padrão para Vite).

## 3. Variáveis de ambiente

No projeto na Vercel, vá em **Settings** → **Environment Variables** e adicione:

| Nome | Valor | Observação |
|------|--------|------------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase | Ex.: `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (public) do Supabase | Em Supabase: Project Settings → API |

Defina as duas para **Production**, **Preview** e **Development** se for usar os três ambientes.

## 4. Deploy

1. Clique em **Deploy**.
2. A Vercel fará o build e publicará a URL (ex.: `seu-projeto.vercel.app`).

O arquivo **vercel.json** na raiz já está configurado para:

- Usar o diretório de build **dist**.
- Aplicar **rewrites** para o **index.html**, para o roteamento do React Router (SPA) funcionar em todas as rotas (ex.: `/documentos`, `/processos`).

## 5. Depois do deploy

- **Domínio:** em **Settings** → **Domains** você pode adicionar um domínio próprio.
- **Supabase:** em **Authentication** → **URL Configuration**, adicione a URL da Vercel (ex.: `https://seu-projeto.vercel.app`) em **Site URL** e em **Redirect URLs**, para o login funcionar corretamente.

## Resumo

- Código em um repositório Git.
- Projeto importado na Vercel com root (se necessário), framework Vite, build `npm run build`, output `dist`.
- Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas na Vercel.
- Deploy e, em seguida, configurar a URL do app no Supabase (Site URL e Redirect URLs).

Com isso, o projeto fica pronto para ficar online na Vercel.
