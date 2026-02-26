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

## 3.1. Tabela da Agenda (reuniões locais)

Para que as reuniões criadas na **Agenda** sejam salvas e apareçam na lista e no Dashboard:

1. No [Supabase](https://supabase.com), abra seu projeto → **SQL Editor**.
2. Crie uma nova query e **cole o conteúdo completo** do arquivo `supabase/migrations/20250225000000_create_agenda_events.sql` (não cole o caminho do arquivo, e sim o texto SQL que está dentro dele).
3. Execute a query (Run). Assim a tabela `agenda_events` e as políticas de segurança (RLS) são criadas.

Se não fizer isso, ao clicar em "Criar reunião" aparecerá erro e a reunião não será salva.

## 3.2. Logo do escritório (opcional)

Para permitir que o cliente faça upload da logo nas **Configurações** e ela apareça no painel e no dashboard:

1. No Supabase → **SQL Editor**, execute o conteúdo do arquivo `supabase/migrations/20250225100000_add_firm_logo_to_profiles.sql` (adiciona a coluna `firm_logo_url` na tabela `profiles`).
2. O upload usa o bucket **documents** do Storage. Se o bucket existir e permitir uploads do usuário autenticado, a logo funcionará; se der erro de permissão, crie uma política no Storage para a pasta `logos/` no bucket `documents` (ou use um bucket público `logos`).

## 3.3. Monitoramento de processos (Escavador) — banco

Para o sistema poder monitorar processos (1x por dia por processo), planos (Start/Pro/Elite) e salvar movimentações:

1. No [Supabase](https://supabase.com), abra seu projeto → **SQL Editor**.
2. Crie uma nova query e **cole todo o conteúdo** do arquivo `supabase/migrations/20250225200000_process_monitor_plans_and_movements.sql`.
3. Clique em **Run**. Isso cria/atualiza:
   - coluna `last_checked_at` em `processos`
   - coluna `subscription_plan` em `profiles` (padrão: `start`)
   - tabelas `process_movements` e `process_monitor_logs`

Sem rodar essa migration, o dashboard de “Consultas de processos” e o limite por plano podem dar erro ou não funcionar.

## 3.4. Despesas do escritório (Financeiro)

Para a aba **Despesas** na seção Financeiro (luz, água, assinaturas, outros), no Supabase → **SQL Editor** execute o conteúdo de `supabase/migrations/20250225220000_office_expenses.sql`.

## 3.5. RLS multi-tenant (recomendado)

Para que cada usuário veja apenas **suas** movimentações de processos e **suas** despesas, execute no SQL Editor o conteúdo de `supabase/migrations/20250225230000_rls_multi_tenant.sql`. Deve ser aplicado **depois** das migrations 3.3 e 3.4.

## 4. Deploy

1. Clique em **Deploy**.
2. A Vercel fará o build e publicará a URL (ex.: `seu-projeto.vercel.app`).

O arquivo **vercel.json** na raiz já está configurado para:

- Usar o diretório de build **dist**.
- Aplicar **rewrites** para o **index.html**, para o roteamento do React Router (SPA) funcionar em todas as rotas (ex.: `/documentos`, `/processos`).

## 5. Tela branca ou “Carregando…” que não sai?

Siga na ordem:

**A) Root Directory (repositório com mais de uma pasta)**  
Se o repositório não for só o app (ex.: tem pasta `smart-case-mate` dentro), em **Settings** → **General** → **Root Directory** defina a pasta que contém o `package.json` e o `vite.config` (ex.: `smart-case-mate`). Salve e faça **Redeploy**.

**B) Variáveis de ambiente**  
Em **Settings** → **Environment Variables**:
- **Key** = nome exato: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- **Value** = a URL completa do Supabase e a chave **anon public** (não coloque a URL/chave no campo Key).
- Marque **Production** (e Preview se quiser).
- Depois de salvar, faça **Redeploy** (Deployments → ⋮ → Redeploy). Variáveis novas só valem em deploy novo.

**C) Console do navegador**  
Abra a URL do deploy (ex.: `sistemaadvocacia-mocha.vercel.app`), pressione **F12** → aba **Console**. Se aparecer erro em vermelho, anote a mensagem (ou envie um print). Isso indica se falta variável, 404 no JS ou outro erro em tempo de execução.

## 6. "Failed to fetch" ao logar ou criar conta

Esse erro aparece quando o navegador não consegue falar com o Supabase. Ajuste no **Supabase**:

1. Abra o [Dashboard do Supabase](https://supabase.com/dashboard) → seu projeto.
2. Vá em **Authentication** → **URL Configuration**.
3. Em **Site URL**, coloque a URL do seu app na Vercel, por exemplo:  
   `https://sistemaadvocacia-mocha.vercel.app`
4. Em **Redirect URLs**, adicione (uma por linha):
   - `https://sistemaadvocacia-mocha.vercel.app`
   - `https://sistemaadvocacia-mocha.vercel.app/**`
   - Se tiver outros domínios (ex.: preview), adicione também.
5. Salve (**Save**).

Confirme também que o projeto não está **pausado** (no free tier, projetos pausam por inatividade; na home do projeto aparece um aviso e um botão para retomar).

## 7. Depois do deploy

- **Domínio:** em **Settings** → **Domains** você pode adicionar um domínio próprio.
- **Supabase:** além do passo 6 acima, use a mesma URL em **Site URL** e **Redirect URLs** para o login e o redirect pós-login funcionarem.

## Resumo

- Código em um repositório Git.
- Projeto importado na Vercel com root (se necessário), framework Vite, build `npm run build`, output `dist`.
- Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas na Vercel.
- Deploy e, em seguida, configurar a URL do app no Supabase (Site URL e Redirect URLs).

Com isso, o projeto fica pronto para ficar online na Vercel.

---

## 8. Onde colocar a API do Escavador (monitoramento de processos)

O monitoramento diário usa a **API do Escavador**. O token da API **não** vai na Vercel nem no frontend — vai no **Supabase**, na Edge Function que roda o cron.

### Passo 1 — Token no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard) → seu projeto.
2. No menu lateral: **Edge Functions** (ou **Project Settings** → **Edge Functions**).
3. Abra a função **process-monitor-cron** (ou crie/deploy primeiro; veja Passo 2).
4. Vá em **Secrets** (ou **Project Settings** → **Edge Functions** → **Secrets**).
5. Adicione um secret:
   - **Name:** `ESCAVADOR_API_TOKEN`
   - **Value:** o token que o Escavador te deu (gerado no [painel da API Escavador](https://api.escavador.com/)).

Assim a função consegue chamar a API do Escavador quando rodar.

### Passo 2 — Publicar a Edge Function e agendar o cron

1. No seu PC, na pasta do projeto (ex.: `smart-case-mate`), instale o CLI do Supabase se ainda não tiver:  
   `npm install -g supabase`
2. Faça login: `supabase login`
3. Vincule o projeto: `supabase link --project-ref SEU_PROJECT_REF` (o ref está em Supabase → Project Settings → General).
4. Envie a função:  
   `supabase functions deploy process-monitor-cron`
5. Defina o secret pelo CLI (se preferir):  
   `supabase secrets set ESCAVADOR_API_TOKEN=seu_token_aqui`
6. Para rodar **1x por dia** (ex.: 6h), use um agendador externo:
   - **Vercel Cron:** crie em `vercel.json` um cron que chame a URL da Edge Function (com auth) no horário desejado.
   - Ou um serviço como [cron-job.org](https://cron-job.org) que faça um **POST** para:  
     `https://SEU_PROJECT_REF.supabase.co/functions/v1/process-monitor-cron`  
     com header `Authorization: Bearer SEU_ANON_KEY` (ou use a service role key só em ambiente seguro).

Resumo: **rode a migration no SQL Editor (3.3)** e **coloque o token no Supabase (Edge Function Secrets)**. O app em si (Vercel) não precisa do token.
