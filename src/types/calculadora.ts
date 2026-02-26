/**
 * Tipos compartilhados do módulo Calculadora Jurídica (dev.md §14).
 * Reutilizados em Correção de Valores, Meus Cálculos e possível tela de detalhe.
 */

export interface CorrecaoValoresTimelineItem {
  mes: string;
  valorInicio: number;
  correcao: number;
  valorAposCorrecao: number;
  juros: number;
  valorFinal: number;
  indiceAplicado?: number;
}

export interface CorrecaoValoresResult {
  valorInicial: number;
  valorFinal: number;
  dataInicial?: string;
  dataFinal?: string;
  indice?: string;
  tipoJuros?: string;
  percentualMensal?: number | null;
  versao_formula?: number;
  timeline: CorrecaoValoresTimelineItem[];
  memoriaDetalhada: { resumo: string; totalMeses: number };
  tabelaExportavel?: Array<Record<string, unknown>>;
}

/** Parâmetros usados para preencher o formulário de Correção de Valores (ex.: ao abrir a partir de Meus Cálculos). */
export interface CorrecaoValoresParametros {
  valorInicial: number;
  dataInicial: string;
  dataFinal: string;
  indice: string;
  tipoJuros: string;
  percentualMensal?: string;
}
