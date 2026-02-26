/**
 * Cliente para API Escavador (movimentações de processos).
 * Base: https://api.escavador.com/api/v2
 * Token via variável de ambiente VITE_ESCAVADOR_API_TOKEN (front) ou ESCAVADOR_API_TOKEN (Edge).
 */

const BASE_URL = 'https://api.escavador.com/api/v2';

export interface EscavadorMovimentacao {
  id: number;
  data: string;
  tipo: string;
  conteudo: string;
  fonte?: {
    fonte_id: number;
    nome: string;
    tipo: string;
    sigla: string;
    grau?: number;
    grau_formatado?: string;
  };
}

export interface EscavadorMovimentacoesResponse {
  items: EscavadorMovimentacao[];
  links?: { next?: string };
  paginator?: { per_page: number };
}

export interface EscavadorError {
  error?: string;
}

function getToken(): string {
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ESCAVADOR_API_TOKEN) ||
    (typeof process !== 'undefined' && (process as any).env?.ESCAVADOR_API_TOKEN) ||
    ''
  );
}

/**
 * Normaliza número do processo para o formato CNJ esperado pela API (ex.: 0018063-19.2013.8.26.0002).
 * Aceita com ou sem pontuação.
 */
export function normalizeProcessNumber(num: string): string {
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.length < 20) return num.trim();
  // CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
  const n = cleaned.slice(0, 7);
  const d = cleaned.slice(7, 9);
  const a = cleaned.slice(9, 13);
  const j = cleaned.slice(13, 14);
  const tr = cleaned.slice(14, 16);
  const o = cleaned.slice(16, 20);
  return `${n}-${d}.${a}.${j}.${tr}.${o}`;
}

/**
 * Busca movimentações do processo na API Escavador.
 * GET /processos/numero_cnj/{numero}/movimentacoes
 */
export async function fetchMovimentacoes(
  processNumber: string,
  options?: { limit?: 50 | 100 | 500 }
): Promise<{ data: EscavadorMovimentacoesResponse | null; error: string | null }> {
  const token = getToken();
  if (!token) {
    return { data: null, error: 'ESCAVADOR_API_TOKEN não configurado' };
  }

  const numero = normalizeProcessNumber(processNumber);
  const url = new URL(`${BASE_URL}/processos/numero_cnj/${encodeURIComponent(numero)}/movimentacoes`);
  if (options?.limit) url.searchParams.set('limit', String(options.limit));

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = (body as EscavadorError).error || res.statusText || `HTTP ${res.status}`;
      return { data: null, error: msg };
    }

    return { data: body as EscavadorMovimentacoesResponse, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro de rede';
    return { data: null, error: message };
  }
}
