import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { produtos, type Produto } from "@/data/products";
import { valorParcela } from "@/lib/pricing";

export interface ProductOverride {
  product_id: string;
  nome: string | null;
  descricao: string | null;
  preco_vista: number | null;
  visivel: boolean;
  fotos_adicionais: string[];
  fotos_ocultas: string[];
  fotos_cores: Record<string, string>;
}

export function mergeProduct(product: Produto, override?: ProductOverride): Produto {
  if (!override) return product;
  const precoVista = override.preco_vista === null ? product.precoVista : Number(override.preco_vista);
  return { ...product, nome: override.nome ?? product.nome, desc: override.descricao ?? product.desc,
    precoVista, parcela: precoVista > 0 ? valorParcela(precoVista) : 0 };
}

const CatalogContext = createContext<{ products: Produto[]; overrides: Record<string, ProductOverride>; refresh: () => Promise<void>; ready: boolean }>({
  products: produtos, overrides: {}, refresh: async () => {}, ready: false,
});

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});
  const [ready, setReady] = useState(false);
  async function refresh() {
    const { data, error } = await supabase.from("product_overrides").select("product_id,nome,descricao,preco_vista,visivel,fotos_adicionais,fotos_ocultas,fotos_cores");
    if (!error) setOverrides(Object.fromEntries((data ?? []).map((row) => [row.product_id, row as ProductOverride])));
    setReady(true);
  }
  useEffect(() => { void refresh(); }, []);
  const products = useMemo(() => produtos.filter((p) => overrides[p.id]?.visivel !== false).map((p) => mergeProduct(p, overrides[p.id])), [overrides]);
  return <CatalogContext.Provider value={{ products, overrides, refresh, ready }}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);

export async function resolveCatalogPhoto(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from("catalog-photos").createSignedUrl(path, 3600);
  return error ? null : data.signedUrl;
}
