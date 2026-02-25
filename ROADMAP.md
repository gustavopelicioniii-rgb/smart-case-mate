# Roadmap Smart Case Mate — Melhorias Premium

Este documento consolida as melhorias que transformam o sistema em produto forte e justificam preço premium (ex.: R$ 600/mês).

---

## 1. ALERTA REAL DE PRAZO PROCESSUAL ✅ (parcial)

**Status:** Implementado
- Cálculo automático em **dias úteis** (feriados forenses descontados).
- Contagem em dias úteis na listagem e no tooltip.
- Alerta antes do vencimento (destaque para ≤ 3 dias úteis e vencidos).
- **Destaque no topo** do Dashboard (card de prazos em primeiro lugar).
- Banner de alerta quando há prazos urgentes (≤ 2 dias).

**Opcional (backend):**
- Cálculo automático de `data_fim` a partir de `data_inicio` + `dias_uteis` ao criar prazo (hoje pode ser manual).
- Job/trigger para marcar status "Vencido" quando `data_fim` < hoje.

---

## 2. CAIXA DE ENTRADA JURÍDICA ✅ (parcial)

**Status:** Implementado
- Seção **"📥 Atualizações hoje"** no topo quando há itens da data atual.
- Seção "Outras atualizações" abaixo.
- Tipos: Publicação, Andamento, Documento, Tarefa, Sistema.

**Falta (aumenta percepção profissional):**
- **Criação automática de itens** ao:
  - Nova publicação (API ou manual).
  - Novo andamento no processo.
  - Documento recebido/upload.
  - Tarefa criada.
- Filtros por tipo e prioridade (botão "Filtros" já existe, conectar).

---

## 3. PROCESSOS

**Hoje:** Básico (lista, detalhe, timeline por andamentos, audiências, abas docs/notas).

**Essencial — Linha do tempo do processo:** ✅ (estrutura)
- Dentro do processo: timeline completa, andamentos, documentos, audiências, responsáveis, notas internas.
- Título "Linha do tempo do processo" e descrição já colocados na aba Timeline.

**Falta:**
- Unificar na mesma timeline: andamentos + documentos + audiências + notas (eventos ordenados por data).
- Campo "responsável" em andamentos/eventos.
- Notas internas como tipo de evento na timeline.

**Game changer — Auto captura do processo:**
- Ao cadastrar **número do processo** (CNJ):
  - Buscar **tribunal** (via API ou regex do número).
  - Buscar **classe**, **partes**, **últimos andamentos** (API do tribunal ou CNJ).
- Sem isso o sistema perde para softwares grandes; prioridade alta para roadmap técnico.

---

## 4. AGENDA

**Hoje:** Boa visualmente.

**Premium obrigatório:**
- **Sincronização real 2 vias:**
  - Google Calendar 2-way.
  - Outlook.
- Criar **Meet** automaticamente ao agendar reunião.
- Botão **"Entrar"** direto no evento (link Meet/Teams).

**Audiência automática do processo:**
- Ao cadastrar audiência no processo → evento aparece na **Agenda** automaticamente (já existe tabela `audiencias` com `process_id`; falta listar na página Agenda).

---

## 5. GERADOR DE PEÇAS (OURO)

**Hoje:** Prompt simples, geração básica.

**Modo profissional:**
1. **Biblioteca de modelos jurídicos:** petição inicial, contestação, recurso, contrato, etc.
2. **Usar dados do processo automaticamente:** ao gerar peça "do processo", puxar partes, tribunal, nº processo, fatos já cadastrados (sem redigitar).
3. **Revisão jurídica IA:**
   - Botões: ✔ Revisar peça | ✔ Melhorar fundamentação | ✔ Resumir.
   - Aumenta muito o valor percebido.

---

## 6. WHATSAPP

**Hoje:** Só configuração.

**Objetivo:** **Central de comunicação**
- Conversa por cliente (ou por processo).
- Histórico de mensagens.
- Ações: enviar documento, notificar prazo, cobrar honorário.
- Se ficar só "API técnica" não agrega valor ao usuário final.

---

## 7. FINANCEIRO

**Premium precisa:**
- **Boleto / PIX / link de pagamento:** integração Asaas, Stripe ou Mercado Pago.
  - Gerar cobrança → cliente paga → baixa automática.
- **Honorário por processo:**
  - Honorário vinculado ao processo (já existe relação processo–valor em parte).
  - Parcelas e êxito (%).

---

## 8. DOCUMENTOS

**Falta:**
- **OCR + busca inteligente:** ao fazer upload de PDF, sistema lê texto (OCR), indexa e permite buscar ex.: "contrato João". Nível software caro.

---

## 9. PUBLICAÇÕES

**Pergunta crítica:** Está capturando automaticamente via API?
- Se **não**, deve ser prioridade.
- Sem captura automática (diário oficial / tribunais), o módulo perde valor.

---

## 10. RELATÓRIOS

**Premium precisa — Relatórios de negócio:**
- Faturamento por cliente.
- Processos ganhos/perdidos.
- Produtividade por advogado.
- Tempo médio do processo.
- Ticket médio.
- Isso vende para donos de escritório.

---

## TOP 10 O QUE FALTA NO SISTEMA (geral)

| # | Item | Descrição |
|---|------|-----------|
| 1 | **Portal do cliente** | Cliente entra e vê: processo, documentos, mensagens, boletos. Justifica +R$ 150 no preço. |
| 2 | **Multi escritório / multi usuários avançado** | Permissões; advogado só vê seus processos. |
| 3 | **Logs de atividade** | "Quem alterou o quê" — essencial jurídico (tabela `activity_logs` já existe no SQL). |
| 4 | **Assinatura eletrônica integrada** | Clicksign, DocuSign, etc. Alto valor percebido. |
| 5 | **Backup visível** | Mostrar "✔ Backup diário ativo" para gerar confiança. |
| 6 | **Onboarding guiado** | Primeiro login: cadastrar processo, cadastrar cliente, importar dados. |
| 7 | **Importação automática do sistema antigo** | CSV guiado para reduzir medo da troca. |

---

## Ordem sugerida de implementação (resumo)

1. **Já feito:** Prazos (dias úteis, destaque, alerta); Inbox "Atualizações hoje"; Timeline do processo destacada.
2. **Curto prazo:** Auto-criação de itens na Inbox; audiência do processo na Agenda; logs de atividade (front + políticas).
3. **Médio prazo:** Auto captura do processo (API/CNJ); sincronização calendário; gerador de peças profissional; honorário por processo + parcelas/êxito.
4. **Longo prazo:** Portal do cliente; integrações pagamento; OCR documentos; assinatura eletrônica; multi-escritório avançado.

---

*Documento gerado a partir do backlog de melhorias premium. Atualizar conforme entregas.*
