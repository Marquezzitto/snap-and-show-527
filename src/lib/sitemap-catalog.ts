export async function collectPublicOverrides<T extends { product_id: string; visivel: boolean }>(
  readPage: (offset: number, pageSize: number) => Promise<T[]>,
  pageSize = 1000,
) {
  const rows: T[] = [];
  for (let offset = 0; ; ) {
    const page = await readPage(offset, pageSize);
    if (!page.length) break;
    rows.push(...page);
    offset += page.length;
  }
  return rows;
}

export function visibleProductIds(products: { id: string }[], overrides: { product_id: string; visivel: boolean }[]) {
  const hidden = new Set(overrides.filter((row) => !row.visivel).map((row) => row.product_id));
  return products.filter((product) => !hidden.has(product.id)).map((product) => product.id);
}