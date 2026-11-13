import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { brl } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { CatalogImage } from "./CatalogImage";
import { getProductPhotos } from "@/data/productPhotos";
import { useHomepageCarousel, resolveBanner } from "@/lib/homepage-carousel";

export function BannerImage({ path, fallback, alt, className }: { path: string; fallback?: string | undefined; alt: string; className: string }) {
  const [resolved, setResolved] = useState<{ path: string; url: string }>();
  useEffect(() => {
    if (!path) { setResolved(undefined); return; }
    let active = true;
    const load = () => void resolveBanner(path).then((url) => { if (active) setResolved({ path, url }); }).catch(() => {});
    load();
    const timer = window.setInterval(load, 50 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, [path]);
  const src = path && resolved?.path === path ? resolved.url : fallback;
  return <CatalogImage src={src} alt={alt} className={className} />;
}

export function HomepageCarousel() {
  const { slides, products, overrides } = useHomepageCarousel();
  const visible = slides.filter((s) => products.some((p) => p.id === s.productId));
  const [ref, api] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [interacting, setInteracting] = useState(false);
  useEffect(() => {
    if (!api) return;
    const sync = () => setSelected(api.selectedScrollSnap());
    sync();
    api.on("select", sync); api.on("reInit", sync);
    return () => { api.off("select", sync); api.off("reInit", sync); };
  }, [api]);
  useEffect(() => {
    if (!api || !playing || interacting || visible.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => { if (!document.hidden) api.scrollNext(); }, 6000);
    return () => window.clearInterval(timer);
  }, [api, playing, interacting, visible.length]);
  if (!visible.length) return null;
  return <section aria-label="Destaques Marks Imports" aria-roledescription="carrossel" className="relative overflow-hidden border-b border-border bg-background"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false); }}>
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_60%)]" />
    <div className="relative mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <div ref={ref} className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-2xl backdrop-blur">
        <div className="flex touch-pan-y">
          {visible.map((s) => {
            const product = products.find((p) => p.id === s.productId);
            if (!product) return null;
            const fallback = getProductPhotos(product, overrides[product.id]).gallery[0];
            const active = visible[selected]?.id === s.id;
            return <div key={s.id} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={product.nome}>
              <Link to="/produto/$productId" params={{ productId: product.id }} tabIndex={active ? 0 : -1} aria-label={`Ver ${product.nome}`} className="group block">
                {s.imagePath ? (
                  <div className="relative aspect-[2/1] w-full bg-secondary sm:aspect-[3/1]">
                    <BannerImage path={s.imagePath} fallback={fallback} alt={product.nome} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                    <span className="absolute bottom-4 right-4 hidden rounded-full bg-background/85 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground backdrop-blur sm:inline-block">Ver produto →</span>
                  </div>
                ) : (
                  <div className="grid min-h-[280px] grid-cols-1 items-center gap-4 p-6 sm:min-h-[380px] sm:grid-cols-[1.1fr_1fr] sm:p-12">
                    <div className="order-2 sm:order-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">{product.categoria}</p>
                      <h2 className="mt-3 text-3xl font-black leading-tight text-foreground sm:text-5xl">{product.nome}</h2>
                      {product.precoVista > 0 && <p className="mt-4 text-lg text-muted-foreground">a partir de <span className="font-bold text-foreground">{brl(product.precoVista)}</span></p>}
                      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-transform group-hover:translate-x-1">Ver produto <ArrowRight className="h-4 w-4" /></span>
                    </div>
                    <div className="order-1 flex h-48 items-center justify-center sm:order-2 sm:h-80">
                      <BannerImage path="" fallback={fallback} alt={product.nome} className="max-h-full max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  </div>
                )}
              </Link>
            </div>;
          })}
        </div>
      </div>
      {visible.length > 1 && <>
        <Button variant="outline" size="icon" title="Imagem anterior" aria-label="Imagem anterior" onClick={() => api?.scrollPrev()} className="absolute left-1 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full border-border/60 bg-background/80 backdrop-blur sm:inline-flex"><ChevronLeft /></Button>
        <Button variant="outline" size="icon" title="Próxima imagem" aria-label="Próxima imagem" onClick={() => api?.scrollNext()} className="absolute right-1 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full border-border/60 bg-background/80 backdrop-blur sm:inline-flex"><ChevronRight /></Button>
        <div className="mt-4 flex items-center justify-center gap-1">
          {visible.map((s, i) => <button key={s.id} type="button" aria-label={`Ir para imagem ${i + 1}`} aria-pressed={selected === i} onClick={() => api?.scrollTo(i)} className="flex h-8 items-center px-1"><span className={`block h-1 rounded-full transition-all duration-500 ${selected === i ? "w-10 bg-accent" : "w-5 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`} /></button>)}
          <Button variant="ghost" size="icon" title={playing ? "Pausar carrossel" : "Reproduzir carrossel"} aria-label={playing ? "Pausar carrossel" : "Reproduzir carrossel"} onClick={() => setPlaying(!playing)} className="ml-2 h-8 w-8 text-muted-foreground">{playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</Button>
        </div>
      </>}
    </div>
  </section>;
}
