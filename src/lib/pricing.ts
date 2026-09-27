/**
 * Regras de precificação da vitrine.
 * MARGEM          -> acréscimo sobre o valor do PDF (+40%)
 * TAXA_MAQUININHA -> juros do parcelamento em 3x
 */
export const MARGEM = 0.4; // 40%
export const TAXA_MAQUININHA = 0.05; // 5%
export const PARCELAS = 3;

/** Preço final à vista = base * (1 + margem) */
export function precoFinal(base: number, margem: number = MARGEM): number {
  return base * (1 + margem);
}

/** Valor de cada parcela = (preço à vista * (1 + taxa)) / nº de parcelas */
export function valorParcela(
  precoAVista: number,
  taxa: number = TAXA_MAQUININHA,
  parcelas: number = PARCELAS,
): number {
  return (precoAVista * (1 + taxa)) / parcelas;
}

export function brl(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}
