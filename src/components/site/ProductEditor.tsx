import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Produto } from "@/data/products";
import { getProductPhotos } from "@/data/productPhotos";
import { useCatalog, type ProductOverride } from "@/lib/catalog";
import { CatalogImage } from "./CatalogImage";
import { Button } from "@/components/ui/button";

const schema = z.object({
  nome: z.string().trim().min(1).max(200), descricao: z.string().trim().max(2000),
  preco: z.union([z.literal(""), z.coerce.number().min(0).max(1000000)]),
});
const MAX_FILES = 20;
const MAX_SIZE = 5 * 1024 * 1024;

export function ProductEditor({ product }: { product: Produto }) {
  const { overrides, refresh } = useCatalog();
  const original = overrides[product.id];
  const originalName = product.nome;
  const originalDesc = product.desc;
  const [draft, setDraft] = useState<ProductOverride>(() => ({ product_id: product.id, nome: original?.nome ?? product.nome, descricao: original?.descricao ?? product.desc,
    preco_vista: original?.preco_vista ?? null, visivel: original?.visivel ?? true, fotos_adicionais: original?.fotos_adicionais ?? [], fotos_ocultas: original?.fotos_ocultas ?? [], fotos_cores: original?.fotos_cores ?? {} }));
  const [busy, setBusy] = useState(false);
  const [newPrice, setNewPrice] = useState(original?.preco_vista === null || original?.preco_vista === undefined ? "" : String(original.preco_vista));
  useEffect(() => {
    setDraft({ product_id: product.id, nome: original?.nome ?? product.nome, descricao: original?.descricao ?? product.desc, preco_vista: original?.preco_vista ?? null,
      visivel: original?.visivel ?? true, fotos_adicionais: original?.fotos_adicionais ?? [], fotos_ocultas: original?.fotos_ocultas ?? [], fotos_cores: original?.fotos_cores ?? {} });
    setNewPrice(original?.preco_vista === null || original?.preco_vista === undefined ? "" : String(original.preco_vista));
  }, [product.id, original]);
  const { gallery } = getProductPhotos(product, draft);
  const hidden = draft.fotos_ocultas;
  async function save(next: ProductOverride = draft) {
    const values = schema.safeParse({ nome: next.nome, descricao: next.descricao, preco: newPrice.replace(",", ".") });
    if (!values.success) { toast.error("Confira o nome, a descrição e o preço (até R$ 1 milhão)."); return; }
    setBusy(true);
    const { error } = await supabase.from("product_overrides").upsert({ ...next, nome: values.data.nome, descricao: values.data.descricao,
      preco_vista: values.data.preco === "" ? null : Number(values.data.preco) });
    setBusy(false);
    if (error) { toast.error("Não foi possível salvar as alterações."); return; }
    await refresh();
    toast.success("Produto atualizado na vitrine.");
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (files.length + draft.fotos_adicionais.length > MAX_FILES) { toast.error("Limite de 20 fotos adicionais por produto."); return; }
    setBusy(true);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_SIZE) {
        toast.error("Use JPG, PNG ou WebP de até 5 MB."); continue;
      }
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${product.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("catalog-photos").upload(path, file, { contentType: file.type, upsert: false });
      if (error) { toast.error(`Falha no envio de ${file.name}.`); continue; }
      added.push(`catalog-photos/${path}`);
    }
    if (added.length) {
      const next = { ...draft, fotos_adicionais: [...draft.fotos_adicionais, ...added] };
      setDraft(next);
      const { error } = await supabase.from("product_overrides").upsert(next);
      if (error) toast.error("As fotos foram enviadas, mas não foi possível vinculá-las. Tente salvar novamente.");
      else { await refresh(); toast.success(`${added.length} foto(s) enviada(s).`); }
    }
    setBusy(false);
  }
  async function removePhoto(src: string) {
    const isUpload = draft.fotos_adicionais.includes(src);
    const next: ProductOverride = { ...draft,
      fotos_adicionais: isUpload ? draft.fotos_adicionais.filter((x) => x !== src) : draft.fotos_adicionais,
      fotos_ocultas: isUpload ? draft.fotos_ocultas : [...new Set([...draft.fotos_ocultas, src])],
      fotos_cores: Object.fromEntries(Object.entries(draft.fotos_cores).filter(([, value]) => value !== src)) };
    setBusy(true);
    const { error } = await supabase.from("product_overrides").upsert(next);
    if (error) { toast.error("Não foi possível remover a foto."); setBusy(false); return; }
    setDraft(next);
    await refresh();
    // Delete only the admin's own uploaded files after references are safely removed.
    if (isUpload) await supabase.storage.from("catalog-photos").remove([src.slice("catalog-photos/".length)]);
    setBusy(false);
    toast.success("Foto removida da vitrine.");
  }
  return <details className="mt-4 border-t border-border pt-4 text-sm"><summary className="cursor-pointer font-semibold text-accent">Editar produto, preço e fotos</summary><div className="mt-3 space-y-3">
    <h4 className="font-semibold">Editar produto e fotos</h4>
    <label className="block">Nome<input maxLength={200} value={draft.nome ?? ""} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-secondary p-2" /></label>
    <label className="block">Descrição<textarea maxLength={2000} value={draft.descricao ?? ""} onChange={(e) => setDraft({ ...draft, descricao: e.target.value })} rows={2} className="mt-1 w-full rounded-md border border-border bg-secondary p-2" /></label>
    <label className="block">Preço à vista (R$) <small className="text-muted-foreground">vazio = preço original; 0 = sob consulta</small><input inputMode="decimal" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder={String(product.precoVista.toFixed(2)).replace(".", ",")} className="mt-1 w-full rounded-md border border-border bg-secondary p-2" /></label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visivel} onChange={(e) => setDraft({ ...draft, visivel: e.target.checked })} />Visível na loja</label>
    <p className="text-xs text-muted-foreground">Ocultar remove o produto da loja; pedidos anteriores permanecem registrados.</p>
    <Button size="sm" disabled={busy} onClick={() => void save()}>{busy ? "Salvando..." : "Salvar alterações"}</Button>
    <div className="border-t border-border pt-3"><label className="block font-medium">Adicionar fotos (JPG, PNG ou WebP, até 5 MB cada)<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} className="mt-2 block w-full text-xs" /></label>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{gallery.map((src) => <div key={src} className="rounded border border-border p-1"><CatalogImage src={src} alt={`Foto de ${product.nome}`} className="aspect-square w-full object-contain" /><Button size="sm" variant="outline" disabled={busy} className="mt-1 h-7 w-full text-xs" onClick={() => void removePhoto(src)}>Excluir</Button></div>)}</div>
      {hidden.length > 0 && <div className="mt-3"><p className="text-xs font-semibold">Fotos ocultas do catálogo original</p>{hidden.map((src) => <Button key={src} variant="ghost" size="sm" disabled={busy} onClick={() => setDraft({ ...draft, fotos_ocultas: hidden.filter((x) => x !== src) })}>Restaurar foto</Button>)}<p className="text-xs text-muted-foreground">Clique em salvar para confirmar a restauração.</p></div>}
      {product.cores.length > 0 && <div className="mt-3 space-y-2"><p className="font-medium">Foto ao selecionar cada cor</p>{product.cores.map((cor) => <label key={cor} className="flex items-center gap-2"><span className="w-24 shrink-0 truncate">{cor}</span><select className="min-w-0 flex-1 rounded border border-border bg-secondary p-2" value={draft.fotos_cores[cor] ?? ""} onChange={(e) => setDraft({ ...draft, fotos_cores: { ...draft.fotos_cores, [cor]: e.target.value } })}><option value="">Foto original / primeira foto</option>{gallery.map((src, i) => <option key={src} value={src}>Foto {i + 1}</option>)}</select></label>)}<Button size="sm" disabled={busy} variant="outline" onClick={() => void save()}>Salvar fotos por cor</Button></div>}
    </div>
  </div></details>;
}
