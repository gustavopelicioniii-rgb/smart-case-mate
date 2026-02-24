
# Modulo Completo de Agenda e Reunioes - Advogado 10X

## Visao Geral

Transformar a pagina de Agenda atual (simples lista de eventos) em um modulo completo com calendario visual, gestao de reunioes, integracao com processos/CRM/dashboard, e preparacao para APIs do Google Meet e Zoom.

---

## Arquivos a Criar

### 1. `src/types/agenda.ts`
Tipos compartilhados para reunioes e eventos:
- `Meeting` (id, titulo, cliente, processo, data, horario inicio/fim, participantes, tipo: presencial/meet/zoom, link, status)
- `AgendaEvent` (id, titulo, tipo: audiencia/reuniao/prazo/reuniao-meet/reuniao-zoom, data, hora, cliente, processo, local, cor)
- `MeetingStatus` (agendada/em-andamento/concluida/cancelada)

### 2. `src/data/mockMeetings.ts`
Dados mock de reunioes e eventos para toda a aplicacao. Lista de ~8 eventos variados (audiencias, reunioes Meet/Zoom, prazos) usados em todos os modulos.

### 3. `src/components/agenda/CalendarView.tsx`
Calendario visual customizado (sem dependencia externa alem do react-day-picker ja instalado):
- Visualizacao dia/semana/mes via tabs
- Dias com eventos marcados com dots coloridos
- Clique no dia mostra eventos daquele dia
- Cores por tipo: audiencia (vermelho), reuniao cliente (azul), prazo (laranja)

### 4. `src/components/agenda/NewMeetingModal.tsx`
Modal completo com Dialog do shadcn:
- Campos: titulo, cliente (select com mock CRM), processo (select opcional), data (DatePicker), horario inicio/fim, participantes (input)
- Tipo de reuniao: Presencial / Google Meet / Zoom (radio group)
- Se Meet ou Zoom: campo "Link da reuniao" com botao "Gerar link automaticamente" (simula geracao)
- Botoes: Cancelar / Criar reuniao
- Toast de confirmacao ao criar

### 5. `src/components/agenda/MeetingCard.tsx`
Card reutilizavel para exibir reuniao em qualquer contexto (Dashboard, Agenda, Processo, CRM):
- Nome, horario, cliente, tipo (badge com icone Meet/Zoom/Presencial)
- Botao verde "Entrar na reuniao" (para Meet/Zoom)
- Botao "Editar"
- Indicador visual: Urgente (vermelho) / Hoje (azul) / Em breve (cinza)

### 6. `src/components/agenda/JoinMeetingModal.tsx`
Modal elegante ao clicar "Entrar na reuniao":
- Loading animado com mensagem "Preparando sua reuniao..."
- Apos 2s mostra botao "Abrir Reuniao" + detalhes (titulo, link, participantes)
- Clique simula abertura (window.open ou toast)

### 7. `src/components/agenda/AgendaSubNav.tsx`
Sub-navegacao dentro da pagina de Agenda com tabs:
- Hoje / Semana / Audiencias / Reunioes
- Filtra os eventos exibidos

---

## Arquivos a Modificar

### 8. `src/pages/Agenda.tsx` (reescrever)
Pagina completa com:
- Header com titulo + botao "+ Nova Reuniao" (abre NewMeetingModal)
- AgendaSubNav (tabs: Hoje/Semana/Audiencias/Reunioes)
- Layout 2 colunas em desktop: CalendarView (esquerda) + lista de eventos (direita)
- Eventos filtrados por tab ativa
- Cada evento usa MeetingCard
- Animacoes framer-motion consistentes com resto do app

### 9. `src/components/dashboard/TodayActions.tsx`
Adicionar reunioes do dia na lista de acoes:
- Novos itens mock de reuniao com icone Video
- Botao de acao "Entrar" que abre JoinMeetingModal
- Badge visual: Urgente/Hoje/Em breve

### 10. `src/pages/Processos.tsx`
Adicionar secao "Reunioes do Processo" abaixo da tabela (ou dentro do tooltip expandido):
- Lista de reunioes vinculadas ao processo (mock)
- Cada reuniao com data, titulo, status, botao entrar, botao editar
- Botao "+ Agendar Reuniao"

### 11. `src/pages/CRM.tsx`
Adicionar ao card de cliente no pipeline:
- Indicador de proxima reuniao (se houver)
- No card expandido/tooltip: secao "Reunioes" com historico e proximas
- Botao "Agendar Reuniao"

### 12. `src/components/layout/AppSidebar.tsx`
Atualizar o item "Agenda" para mostrar sub-itens visuais (ou manter simples com badge de contagem de reunioes do dia).

### 13. `src/App.tsx`
Sem alteracao de rotas necessaria - `/agenda` ja existe.

---

## Detalhes Tecnicos

- **Calendario**: Usar `react-day-picker` (ja instalado) com custom rendering para dots de eventos nos dias
- **Modais**: `Dialog` do shadcn/radix (ja disponivel)
- **DatePicker**: Popover + Calendar do shadcn com `pointer-events-auto`
- **Select de cliente/processo**: `Select` do shadcn com dados mock
- **Horarios**: Inputs de time nativos estilizados
- **Tipo reuniao**: `RadioGroup` do shadcn
- **Animacoes**: `framer-motion` (ja instalado) - `AnimatePresence` para modais e transicoes
- **Icones**: `lucide-react` - Video, VideoOff, ExternalLink, Calendar, Clock, Users, Plus, MapPin
- **Cores por tipo**: audiencia = destructive, reuniao = info, prazo = warning, meet = verde, zoom = azul
- **Toast**: `sonner` para feedback de acoes

## Ordem de Implementacao

1. Tipos + dados mock
2. Componentes reutilizaveis (MeetingCard, JoinMeetingModal)
3. NewMeetingModal
4. CalendarView + AgendaSubNav
5. Reescrever Agenda.tsx
6. Integrar no Dashboard (TodayActions)
7. Integrar em Processos
8. Integrar em CRM
9. Atualizar Sidebar
