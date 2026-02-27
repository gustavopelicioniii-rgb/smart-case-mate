# Deploy na Vercel

O projeto está pronto para subir na Vercel. Siga os passos abaixo.

## Atualização no celular (cache)

Depois de um novo deploy, se no **celular** a versão não atualizar (temas, fontes, menu, Calculadora Jurídica):

- **Android (Chrome):** abra o menu (⋮) → **Configurações** → **Privacidade e segurança** → **Limpar dados de navegação** → marque "Imagens e arquivos em cache" → Limpar. Ou abra o site em uma **aba anônima** para testar a versão nova.
- **iOS (Safari):** Ajustes → Safari → Limpar Histórico e Dados de Websites. Ou use **Adicionar à tela de início** e abra pelo ícone (às vezes carrega a versão mais recente).
- O servidor envia cabeçalhos para o navegador não guardar cache do `index.html`, então em visitas seguintes o app deve atualizar; em alguns aparelhos é necessário limpar o cache uma vez após o deploy.

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

## 3.6. Calculadora Jurídica (passo 2 e 3)

A **Calculadora Jurídica** aparece no menu lateral em **FERRAMENTAS** com o nome **"Calculadora Jurídica"** (ícone de calculadora). Se não aparecer, faça um novo deploy do app na Vercel com o código mais recente.

Para a Calculadora funcionar (módulo Correção de Valores e histórico), faça estes dois passos:

### Passo 2 — Criar as tabelas no banco (migration)

1. Acesse o [Supabase](https://supabase.com/dashboard) → seu projeto.
2. No menu lateral, clique em **SQL Editor**.
3. Clique em **New query**.
4. Abra o arquivo do projeto: `supabase/migrations/20250225260000_calculadora_juridica.sql`.
5. **Copie todo o conteúdo** desse arquivo (do início ao fim) e **cole** na caixa de texto do SQL Editor.
6. Clique em **Run** (ou Ctrl+Enter).
7. Deve aparecer “Success” em verde. Assim as tabelas `calculos`, `indices_oficiais` e `calculo_logs` são criadas.

Sem esse passo, ao clicar em “Realizar Cálculo” na Correção de Valores pode dar erro ou o histórico “Meus Cálculos” não funciona.

### Passo 3 — Publicar a Edge Function (cálculo no servidor)

O cálculo é feito no servidor (Edge Function), não no navegador. Use **npx** (não é preciso instalar o Supabase CLI globalmente):

1. No seu computador, abra o terminal **na pasta do projeto** (ex.: `smart-case-mate`).
2. Faça login no Supabase (abre o navegador para você autorizar):  
   `npx supabase login`
3. Vincule o projeto (o **Project ref** está em Supabase → **Project Settings** → **General**):  
   `npx supabase link --project-ref SEU_PROJECT_REF`
4. Envie a função da calculadora:  
   `npx supabase functions deploy calculadora-correcao`

Depois disso, ao preencher o formulário em **Calculadora Jurídica** → **Correção de Valores** e clicar em **Realizar Cálculo**, o sistema chama essa função e exibe o resultado.

**Observação:** Não use `npm install -g supabase` — a instalação global do CLI não é mais suportada. Use sempre `npx supabase` na pasta do projeto.

**Resumo:** Passo 2 = rodar a migration no SQL Editor; Passo 3 = `npx supabase login`, depois `npx supabase link --project-ref XXX`, depois `npx supabase functions deploy calculadora-correcao`.

**Erro 401 ao clicar em "Realizar Cálculo":** O app agora atualiza a sessão antes de chamar a Edge Function e usa o cliente Supabase (headers corretos). Se ainda aparecer 401, faça logout e login novamente e tente de novo; confira também que a Edge Function `calculadora-correcao` está publicada no mesmo projeto cuja URL está em `VITE_SUPABASE_URL`.

## 3.7. Equipe: perfis automáticos e permissões

Para que **todos os usuários convidados apareçam na Equipe** (para o administrador) e para usar **limites de visualização por módulo**:

1. No Supabase → **SQL Editor**, execute o conteúdo de `supabase/migrations/20250226100000_profiles_trigger_and_admin_rls.sql` (trigger que cria perfil ao cadastrar usuário; RLS para só admin ver todos os perfis).
2. Execute também o conteúdo de `supabase/migrations/20250226110000_user_permissions_table.sql` (tabela de permissões por módulo, se ainda não existir).

Assim, quando alguém for convidado e confirmar o e-mail, o perfil será criado e listado na Equipe. Apenas administradores veem a lista completa; na página Equipe você define por membro o que cada um pode **ver** e **editar** em cada módulo.

## 3.8. Logo do escritório (Storage) — se der "Erro ao enviar logo" ou RLS no Storage

Para que o upload da **logo do escritório** (Configurações) funcione, o bucket `documents` precisa permitir que usuários autenticados enviem arquivos na pasta `logos/<id do usuário>/`. Se ao *salvar* a URL da logo aparecer erro de RLS na tabela `profiles`, execute também no SQL Editor o conteúdo de `supabase/migrations/20250226120000_profiles_update_own.sql` (permite que o usuário atualize o próprio perfil).

### Opção A — Rodar a migration (recomendado)

1. No Supabase → **SQL Editor**, abra uma nova query.
2. Copie **todo** o conteúdo do arquivo `supabase/migrations/20250226130000_storage_logos_policy.sql`.
3. Cole no editor e clique em **Run**.
4. Deve aparecer "Success". As políticas de Storage para a pasta `logos/` passam a valer.

### Opção B — Criar as políticas pelo Dashboard (passo a passo)

1. Acesse o [Supabase](https://supabase.com/dashboard) e abra seu projeto.
2. No menu da esquerda, clique em **Storage**.
3. Clique no bucket **documents** (se não existir, crie um bucket chamado `documents` e marque **Public** se quiser que as logos sejam acessíveis por URL pública).
4. Abra a aba **Policies** (ou **Policies** no topo da página do bucket).
5. Clique em **New Policy** (ou **Create policy**).
6. **Upload (INSERT):**
   - **Policy name:** `Users can upload own logo in documents/logos`
   - **Allowed operation:** `INSERT` (ou "Insert").
   - **Target roles:** `authenticated`.
   - **Policy definition:** "Use this template" → **Custom** e use a expressão:
     - **WITH CHECK expression:**  
       `bucket_id = 'documents' and (storage.foldername(name))[1] = 'logos' and (storage.foldername(name))[2] = (select auth.uid()::text)`
   - Salve.
7. **Leitura (SELECT):** Crie outra política:
   - **Policy name:** `Users can read own logos in documents`
   - **Allowed operation:** `SELECT`
   - **Target roles:** `authenticated`
   - **USING expression:**  
     `bucket_id = 'documents' and (storage.foldername(name))[1] = 'logos' and (storage.foldername(name))[2] = (select auth.uid()::text)`
   - Salve.
8. **Atualização (UPDATE)** e **Remoção (DELETE):** Se a interface permitir, crie políticas análogas para `UPDATE` e `DELETE` com a mesma condição (bucket `documents`, pasta `logos/`, e segundo segmento da pasta = `auth.uid()::text`). Caso contrário, use a **Opção A** (migration) que já inclui INSERT, SELECT, UPDATE e DELETE.

Assim, cada usuário só envia, lê, atualiza e remove arquivos em `documents/logos/<próprio id>/`, e o "Erro ao enviar logo" por política de Storage deixa de ocorrer.

**Se ainda tiver problema com logo ou com a Calculadora (ex.: 401, RLS, recursão), use o checklist:** `CHECKLIST-LOGO-E-CALCULADORA.md`.

### Se aparecer "infinite recursion detected in policy for relation profiles"

Isso ocorre quando a política de SELECT em `profiles` (seção 3.7) está ativa e o sistema tenta atualizar o perfil (ex.: ao salvar a URL da logo). Corrija assim:

1. No Supabase → **SQL Editor**, abra uma nova query.
2. Copie **todo** o conteúdo do arquivo `supabase/migrations/20250226140000_profiles_rls_no_recursion.sql`.
3. Cole no editor e clique em **Run**.

Essa migration cria a função `is_admin()` e ajusta a política de leitura de `profiles` para evitar recursão. Depois disso, o upload da logo deve funcionar normalmente.

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

1. No seu PC, na pasta do projeto (ex.: `smart-case-mate`), use **npx** (não instale o CLI globalmente):  
   `npx supabase login`  
   `npx supabase link --project-ref SEU_PROJECT_REF` (o ref está em Supabase → Project Settings → General).
2. Envie a função:  
   `npx supabase functions deploy process-monitor-cron`
3. Defina o secret pelo CLI (se preferir):  
   `npx supabase secrets set ESCAVADOR_API_TOKEN=seu_token_aqui`
6. Para rodar **1x por dia** (ex.: 6h), use um agendador externo:
   - **Vercel Cron:** crie em `vercel.json` um cron que chame a URL da Edge Function (com auth) no horário desejado.
   - Ou um serviço como [cron-job.org](https://cron-job.org) que faça um **POST** para:  
     `https://SEU_PROJECT_REF.supabase.co/functions/v1/process-monitor-cron`  
     com header `Authorization: Bearer SEU_ANON_KEY` (ou use a service role key só em ambiente seguro).

Resumo: **rode a migration no SQL Editor (3.3)** e **coloque o token no Supabase (Edge Function Secrets)**. O app em si (Vercel) não precisa do token.
