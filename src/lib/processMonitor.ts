/**
 * Regras de monitoramento de processos (API Escavador).
 * - Consulta 1x por dia por processo (last_checked_at).
 * - Filtro por palavras-chave relevantes.
 */

const RELEVANT_KEYWORDS = [
  'Sentença',
  'Decisão',
  'Decisão interlocutória',
  'Despacho',
  'Publicação',
  'Intimação',
] as const;

const HOURS_BETWEEN_CHECKS = 24;

export type ProcessForMonitor = {
  id: string;
  number: string;
  last_checked_at: string | null;
  owner_id: string | null;
};

/**
 * Indica se o processo pode ser consultado na API (evita polling no mesmo dia).
 * Retorna true se nunca foi consultado ou se passaram >= 24h desde last_checked_at.
 */
export function shouldCheckProcess(process: ProcessForMonitor): boolean {
  if (!process.last_checked_at) return true;
  const last = new Date(process.last_checked_at).getTime();
  const now = Date.now();
  const diffHours = (now - last) / (1000 * 60 * 60);
  return diffHours >= HOURS_BETWEEN_CHECKS;
}

/**
 * Verifica se o texto da movimentação contém alguma palavra-chave relevante.
 */
export function isRelevantMovement(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return RELEVANT_KEYWORDS.some((kw) =>
    normalized.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
  );
}

/**
 * Retorna o tipo detectado com base na primeira palavra-chave encontrada.
 */
export function detectMovementType(text: string): string {
  if (!text || typeof text !== 'string') return 'Andamento';
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  for (const kw of RELEVANT_KEYWORDS) {
    const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (normalized.includes(kwNorm)) return kw;
  }
  return 'Andamento';
}

export { RELEVANT_KEYWORDS };
