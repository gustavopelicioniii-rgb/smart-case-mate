# Dashboard — Sincronização e fontes de dados

Este documento explica como o dashboard obtém os dados e onde cadastrar informações para que tudo apareça sincronizado.

## Fontes de dados

| Bloco do dashboard | Fonte | Onde cadastrar/alterar |
|--------------------|--------|-------------------------|
| **Resumo do dia** (header) | Prazos urgentes (0–2 dias úteis) + quantidade de honorários pendentes/atrasados | Processos (próximo prazo) + tabela `deadlines`; Financeiro (honorários) |
| **Prazos processuais** | Tabela `deadlines` **e** campo "Próximo prazo" de cada processo | Processos → editar processo → "Próximo Prazo"; ou cadastro de prazos na tabela `deadlines` |
| **Risco da Semana** | Mesmos prazos + honorários atrasados/vencendo | Idem acima + Financeiro |
| **O que fazer hoje** | Prazos urgentes, honorários atrasados, eventos de hoje (Google Agenda), **Inbox** | Processos, Financeiro, Agenda; para tarefas manuais → **Inbox** |
| **Atividade Inteligente** | Inbox (itens recentes) | **Inbox** |
| **Receita / cards** | Honorários (fees), processos, CRM | Financeiro, Processos, CRM |
| **Recomendação da IA** | Honorários, processos, CRM | Idem |

## Sincronização

- **Próximo prazo do processo:** ao preencher ou alterar o campo "Próximo Prazo" ao editar um processo (Processos → editar), esse prazo passa a aparecer em **Prazos processuais**, no **Resumo do dia** (se estiver a 0–2 dias úteis) e em **O que fazer hoje**.
- **Honorários:** itens em Financeiro com status Pendente ou Atrasado entram no resumo do dia (quantidade) e nas recomendações; honorários atrasados aparecem em "O que fazer hoje".
- **To-do / tarefas do dia:** use a **Inbox** para criar tarefas; elas aparecem em "O que fazer hoje" e em "Atividade Inteligente". Prazos e honorários são preenchidos nos módulos Processos e Financeiro.

## Onde adicionar tarefas (to-do list)

- **Inbox** (`/inbox`): crie itens com título, descrição e prioridade. Eles passam a aparecer em **O que fazer hoje** e em **Atividade Inteligente**.
- Prazos e cobranças continuam sendo cadastrados em **Processos** (Próximo prazo) e **Financeiro** (honorários); a lista "O que fazer hoje" é montada automaticamente a partir desses dados e da Inbox.
