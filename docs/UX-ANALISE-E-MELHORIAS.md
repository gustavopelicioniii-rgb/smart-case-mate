# Análise de UX e Usabilidade — Smart Case Mate

Análise com base em princípios de **design centrado no usuário**, **acessibilidade (WCAG)** e **design system**, alinhada ao agente UX-Design Expert.

---

## Pontos fortes atuais

- **Hierarquia visual clara**: Dashboard com blocos bem definidos (Risco da Semana, O que fazer hoje, Receita, Recomendações IA, Atividade).
- **Feedback imediato**: Toasts (Sonner) para ações; estados de loading em operações assíncronas.
- **Navegação consistente**: Sidebar fixa no desktop, bottom nav no mobile, mesma estrutura de rotas.
- **Design tokens**: Uso de variáveis CSS (background, foreground, primary, destructive, etc.) e suporte a `.dark` no `index.css`, facilitando tema e consistência.
- **Linguagem em português**: Interface toda em PT-BR, adequada ao público (advogados).

---

## Sugestões de melhoria (UX)

### 1. **Acessibilidade (WCAG)**

- **Contraste**: Garantir razão de contraste mínima (4.5:1 para texto normal, 3:1 para texto grande) em todos os textos, especialmente em `text-muted-foreground` e badges em fundos claros/escuros.
- **Foco visível**: Revisar `focus-visible` em botões e links (especialmente no sidebar e nos cards clicáveis) para garantir anel de foco visível em navegação por teclado.
- **Labels e ARIA**: Formulários (Login, Nova Reunião, etc.) devem ter `<label>` associados aos inputs e, quando necessário, `aria-describedby` para mensagens de erro.
- **Skip link**: Adicionar um “Pular para o conteúdo” no topo para usuários de leitor de tela.

### 2. **Hierarquia e escaneabilidade**

- **Dashboard**: Considerar um “resumo do dia” em uma linha (ex.: “3 prazos, 2 honorários pendentes”) antes dos blocos maiores, para quem quer só o essencial.
- **Títulos de seção**: Manter padrão (ex.: `font-display` + ícone) em todas as páginas para reforçar a hierarquia.
- **Listas longas**: Em Processos, Inbox e Financeiro, considerar paginação ou virtualização e indicador de “carregando mais” para evitar listas pesadas.

### 3. **Feedback e estados**

- **Ações irreversíveis**: Ex.: excluir processo — manter confirmação (AlertDialog) e, se possível, texto que deixe claro o que será perdido.
- **Salvamento**: Em formulários longos (Processo, Reunião), indicar “Salvo” ou “Alterações não salvas” para reduzir ansiedade.
- **Empty states**: Já há mensagens quando não há dados; manter padrão (ícone + texto + ação sugerida) em todas as listas vazias.

### 4. **Consistência**

- **Botões primários**: Usar sempre o mesmo padrão para a ação principal da tela (ex.: “Salvar”, “Criar reunião”).
- **Ícones**: Manter estilo (outline vs preenchido) consistente; Lucide já ajuda.
- **Datas e moeda**: Sempre `date-fns` + locale pt-BR e `Intl.NumberFormat` para R$, já adotados — manter em qualquer novo módulo.

### 5. **Mobile**

- **Touch targets**: Garantir mínimo ~44px de altura/área em botões e itens da bottom nav.
- **Gestos**: Evitar gestos que conflitem com scroll (ex.: swipe para excluir só se houver alternativa por toque).
- **Header mobile**: Incluir acesso rápido a tema e configurações (já há User; tema será adicionado).

### 6. **Performance percebida**

- **Skeleton loaders**: Em listas (Processos, Inbox, Financeiro), considerar skeleton em vez de spinner genérico.
- **Stale-while-revalidate**: React Query já faz cache; manter `staleTime` adequado para não recarregar em excesso.

---

## Resumo executivo

O sistema já oferece boa estrutura de navegação, feedback e uso de tokens. As melhorias mais impactantes são: **acessibilidade (contraste e foco)**, **empty states e feedback de salvamento** consistentes, e **botão de tema dark/light** (implementado nesta entrega) para preferência do usuário e uso em ambientes com pouca luz.

Implementado nesta entrega:
- **Botão de alternar modo escuro/claro** na sidebar (desktop) e no header mobile, com persistência da preferência (localStorage via next-themes).
