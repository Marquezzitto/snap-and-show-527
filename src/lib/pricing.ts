/**
 * Regras de precificação da vitrine.
 *
 * MARGEM_CATALOGO_1 -> aplicada aos itens do "Catálogo Marks Imports" (+80%)
 * MARGEM_CATALOGO_2 -> aplicada aos itens de "produtos e valores" (+40%)
 * TAXA_MAQUININHA   -> juros do parcelamento em 3x (somente catálogo 2)
 *
 * Altere os valores abaixo para recalcular toda a vitrine.
 */
export const MARGEM_CATALOGO_1 = 0.8; // 80%
export const MARGEM_CATALOGO_2 = 0.4; // 40%
export const TAXA_MAQUININHA = 0.05; // 5%
export const PARCELAS = 3;

/** Preço final à vista = base * (1 + margem) */
export function precoFinal(base: number, margem: number): number {
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
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
