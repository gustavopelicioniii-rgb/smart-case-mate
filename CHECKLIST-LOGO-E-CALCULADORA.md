# Checklist: problemas ao subir a logo e ao calcular (Calculadora)

Use este checklist quando **a logo não sobe** ou **o cálculo (Correção de Valores) falha** (ex.: Erro 401, política RLS, infinite recursion).

## Logo do escritório

| # | O que verificar | Onde / como |
|---|-----------------|-------------|
| 1 | Coluna `firm_logo_url` existe em `profiles` | SQL Editor: execute `supabase/migrations/20250225100000_add_firm_logo_to_profiles.sql` |
| 2 | Usuário pode **atualizar** o próprio perfil (salvar a URL da logo) | SQL Editor: execute `20250226120000_profiles_update_own.sql` |
| 3 | Bucket **documents** existe | Supabase → Storage: se não existir, crie o bucket (recomendado: **Public** para a logo aparecer na URL pública) |
| 4 | Políticas de Storage para `logos/<user_id>/` | SQL Editor: execute `20250226130000_storage_logos_policy.sql` |
| 5 | Sem recursão na política de `profiles` (erro "infinite recursion detected") | SQL Editor: execute `20250226140000_profiles_rls_no_recursion.sql` |

A mensagem de erro na tela sugere qual migration rodar (Storage vs perfil/recursão).

## Calculadora (Correção de Valores)

| # | O que verificar | Onde / como |
|---|-----------------|-------------|
| 1 | Tabelas da calculadora existem | SQL Editor: execute `20250225260000_calculadora_juridica.sql` |
| 2 | Edge Function **calculadora-correcao** publicada no **mesmo projeto** | Terminal: `npx supabase login`, `npx supabase link --project-ref SEU_REF`, `npx supabase functions deploy calculadora-correcao` |
| 3 | `VITE_SUPABASE_URL` na Vercel = URL do projeto onde a função foi publicada | Vercel → Settings → Environment Variables |
| 4 | Sessão válida (401 / não autorizado) | Fazer **logout** e **login** de novo; o app tenta atualizar a sessão e repetir a chamada automaticamente |

Se ainda falhar, a mensagem de erro na tela indica "Confira (1) está logado; (2) VITE_SUPABASE_URL… (3) Edge Function publicada" e mostra um trecho do detalhe do erro.

---

Ver também: **DEPLOY-VERCEL.md** (seções 3.6, 3.8 e "Se aparecer infinite recursion...").
