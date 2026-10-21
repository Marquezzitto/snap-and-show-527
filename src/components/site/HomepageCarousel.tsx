import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogImage } from "./CatalogImage";
import { getProductPhotos } from "@/data/productPhotos";
import { useHomepageCarousel, resolveBanner } from "@/lib/homepage-carousel";

export function BannerImage({ path, fallback, alt, className }: { path: string; fallback?: string | undefined; alt: string; className: string }) {
  const [resolved, setResolved] = useState<{ path: string; url: string }>();
  useEffect(() => {
    if (!path) return;
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
  return <section aria-label="Destaques Marks Imports" aria-roledescription="carrossel" className="border-b border-border bg-card"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false); }}>
    <div className="relative mx-auto max-w-6xl">
      <div ref={ref} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {visible.map((s) => {
            const product = products.find((p) => p.id === s.productId);
            if (!product) return null;
            return <div key={s.id} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={product.nome}>
              <Link to="/produto/$productId" params={{ productId: product.id }} tabIndex={visible[selected]?.id === s.id ? 0 : -1} aria-label={`Ver ${product.nome}`} className="block aspect-[2/1] w-full bg-secondary sm:aspect-[3/1]">
                <BannerImage path={s.imagePath} fallback={getProductPhotos(product, overrides[product.id]).gallery[0]} alt={product.nome} className={`h-full w-full ${s.imagePath ? "object-contain" : "object-contain p-4 sm:p-8"}`} />
              </Link>
            </div>;
          })}
        </div>
      </div>
      {visible.length > 1 && <>
        <Button variant="outline" size="icon" title="Imagem anterior" aria-label="Imagem anterior" onClick={() => api?.scrollPrev()} className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90"><ChevronLeft /></Button>
        <Button variant="outline" size="icon" title="Próxima imagem" aria-label="Próxima imagem" onClick={() => api?.scrollNext()} className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90"><ChevronRight /></Button>
        <div className="flex min-h-12 items-center justify-center gap-2">
          {visible.map((s, i) => <Button key={s.id} variant="ghost" size="icon" aria-label={`Ir para imagem ${i + 1}`} aria-pressed={selected === i} onClick={() => api?.scrollTo(i)} className="h-8 w-8"><span className={`h-2 w-2 rounded-full ${selected === i ? "bg-accent" : "bg-muted-foreground/40"}`} /></Button>)}
          <Button variant="ghost" size="icon" title={playing ? "Pausar carrossel" : "Reproduzir carrossel"} aria-label={playing ? "Pausar carrossel" : "Reproduzir carrossel"} onClick={() => setPlaying(!playing)} className="h-8 w-8">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
        </div>
      </>}
    </div>
  </section>;
}