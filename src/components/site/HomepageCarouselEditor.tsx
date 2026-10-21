import { useRef, useState } from "react";
import { ArrowUp, ArrowDown, ImagePlus, Replace, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BANNER_BUCKET, useHomepageCarousel } from "@/lib/homepage-carousel";
import { moveSlide, type HomepageSlide } from "@/lib/homepage-carousel-model";
import { getProductPhotos } from "@/data/productPhotos";
import { BannerImage } from "./HomepageCarousel";

export function HomepageCarouselEditor() {
  const { slides, products, overrides, save, loading, error, retry } = useHomepageCarousel();
  const [busy, setBusy] = useState(false);
  const [productId, setProductId] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const target = useRef<string>();

  async function persist(next: HomepageSlide[]) {
    setBusy(true);
    try { await save(next); toast.success("Carrossel atualizado na página inicial."); return true; }
    catch { toast.error("Não foi possível salvar o carrossel. Tente novamente."); return false; }
    finally { setBusy(false); }
  }
  async function upload(file: File | undefined, replacing?: string) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { toast.error("Use JPG, PNG ou WebP de até 5 MB."); return; }
    if (!replacing && !products.some((p) => p.id === productId)) { toast.error("Selecione um produto para vincular à imagem."); return; }
    setBusy(true);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    try {
      const { error: uploadError } = await supabase.storage.from(BANNER_BUCKET).upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const old = slides.find((s) => s.id === replacing);
      const next = replacing ? slides.map((s) => s.id === replacing ? { ...s, imagePath: path } : s)
        : [...slides, { id: crypto.randomUUID(), productId, imagePath: path }];
      try { await save(next); }
      catch (err) { await supabase.storage.from(BANNER_BUCKET).remove([path]); throw err; }
      if (old?.imagePath) await supabase.storage.from(BANNER_BUCKET).remove([old.imagePath]);
      toast.success("Imagem salva no carrossel.");
    } catch { toast.error("Não foi possível enviar a imagem. Tente novamente."); }
    finally { setBusy(false); }
  }
  async function remove(slide: HomepageSlide) {
    if (!window.confirm("Excluir esta imagem do carrossel? O produto continuará na loja.")) return;
    if (await persist(slides.filter((s) => s.id !== slide.id)) && slide.imagePath) await supabase.storage.from(BANNER_BUCKET).remove([slide.imagePath]);
  }
  return <section className="mb-8 border-b border-border pb-8" aria-labelledby="carousel-editor-title">
    <h2 id="carousel-editor-title" className="text-xl font-bold">Carrossel da página inicial</h2>
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <label className="min-w-0 flex-1 text-sm font-medium">Produto vinculado
        <select aria-label="Produto para adicionar ao carrossel" value={productId} onChange={(e) => setProductId(e.target.value)} disabled={busy || loading || error} className="mt-1 block w-full rounded-md border border-border bg-secondary p-2 text-sm">
          <option value="">Selecione um produto</option>{products.map((p) => <option key={p.id} value={p.id}>{p.nome} — {p.codigo}</option>)}
        </select>
      </label>
      <Button disabled={!productId || busy || loading || error} variant="outline" onClick={() => void persist([...slides, { id: crypto.randomUUID(), productId, imagePath: "" }])}>Usar foto do produto</Button>
      <Button disabled={!productId || busy || loading || error} onClick={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4" />Adicionar imagem</Button>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">JPG, PNG ou WebP · até 5 MB · recomendado: 1500 × 500 px</p>
    <input ref={fileRef} aria-label="Enviar imagem do carrossel" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
    <input ref={replaceRef} aria-label="Substituir imagem do carrossel" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { void upload(e.target.files?.[0], target.current); e.target.value = ""; }} />
    {loading ? <p className="mt-4 text-sm text-muted-foreground">Carregando carrossel...</p> : error ? <div role="alert" className="mt-4 text-sm text-destructive">Não foi possível carregar o carrossel.<Button variant="outline" onClick={() => void retry()}>Tentar novamente</Button></div> :
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((slide, i) => {
          const product = products.find((p) => p.id === slide.productId);
          return <article key={slide.id} aria-label={`Imagem ${i + 1} do carrossel`} className="overflow-hidden rounded-md border border-border bg-card">
            <BannerImage path={slide.imagePath} fallback={product ? getProductPhotos(product, overrides[product.id]).gallery[0] : undefined} alt={product?.nome ?? "Produto indisponível"} className="aspect-[3/1] w-full bg-secondary object-contain" />
            <div className="space-y-3 p-3">
              <label className="block text-xs font-medium">Abrir produto
                <select aria-label={`Produto da imagem ${i + 1}`} disabled={busy} value={slide.productId} onChange={(e) => void persist(slides.map((s) => s.id === slide.id ? { ...s, productId: e.target.value } : s))} className="mt-1 block w-full rounded-md border border-border bg-secondary p-2 text-sm">
                  {!product && <option value={slide.productId}>Produto oculto ou indisponível</option>}{products.map((p) => <option key={p.id} value={p.id}>{p.nome} — {p.codigo}</option>)}
                </select>
              </label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" title="Mover antes" aria-label={`Mover imagem ${i + 1} antes`} disabled={busy || i === 0} onClick={() => void persist(moveSlide(slides, i, i - 1))}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" title="Mover depois" aria-label={`Mover imagem ${i + 1} depois`} disabled={busy || i === slides.length - 1} onClick={() => void persist(moveSlide(slides, i, i + 1))}><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" title="Trocar imagem" aria-label={`Trocar imagem ${i + 1}`} disabled={busy} onClick={() => { target.current = slide.id; replaceRef.current?.click(); }}><Replace className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" title="Excluir imagem" aria-label={`Excluir imagem ${i + 1}`} disabled={busy} onClick={() => void remove(slide)} className="ml-auto text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </article>;
        })}
      </div>}
    {!loading && !error && !slides.length && <p className="mt-4 text-sm text-muted-foreground">Nenhuma imagem cadastrada.</p>}
  </section>;
}