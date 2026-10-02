import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { produtos } from "@/data/products";
import { watchPhotos } from "@/data/watchPhotos";
import { brl, PARCELAS } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import { useEstoque } from "@/lib/estoque";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WHATSAPP } from "@/components/site/WhatsAppBubble";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/produto/$productId")({
  loader: ({ params }) => {
    const product = produtos.find((p) => p.id === params.productId);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.nome ?? "Produto"} — Marks Imports` },
    { name: "description", content: `${loaderData?.nome ?? "Produto"}. ${loaderData?.desc ?? "Veja as fotos e opções disponíveis na Marks Imports."}` },
    { property: "og:title", content: `${loaderData?.nome ?? "Produto"} — Marks Imports` },
    { property: "og:description", content: loaderData?.desc ?? "Veja as fotos e opções disponíveis na Marks Imports." },
    { property: "og:type", content: "product" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ProdutoPagina,
});

function ProdutoPagina() {
  const p = Route.useLoaderData();
  const fotos = watchPhotos[p.codigo ?? ""] ?? (p.imagem ? [p.imagem] : []);
  const [foto, setFoto] = useState(0);
  const [cor, setCor] = useState(p.cores[0] ?? "");
  const [tam, setTam] = useState(p.tamanhos[0] ?? "");
  const [quantidade, setQuantidade] = useState(1);
  const { estoque } = useEstoque();
  const { add, setOpen } = useCart();
  useEffect(() => { setFoto(0); setCor(p.cores[0] ?? ""); setTam(p.tamanhos[0] ?? ""); setQuantidade(1); }, [p.id]);
  const geral = p.codigo ? estoque[p.codigo] : undefined;
  const qtd = p.codigo && cor && estoque[`${p.codigo}:${cor}`] !== undefined ? estoque[`${p.codigo}:${cor}`] : geral;
  const esgotado = qtd !== undefined && qtd <= 0;
  const fotoAtual = fotos[foto] ?? fotos[0];

  return <div className="min-h-screen bg-background text-foreground">
    <SiteHeader />
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Navegação">
        <Link to="/" className="hover:text-accent">Produtos</Link><span>/</span><span>{p.categoria}</span><span>/</span><span className="truncate text-foreground">{p.nome}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <section aria-label={`Fotos de ${p.nome}`} className="min-w-0">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
            {fotoAtual ? <img src={fotoAtual} alt={`${p.nome} — foto ${foto + 1}`} className="h-full w-full object-contain p-4" /> : <span className="text-muted-foreground">Foto indisponível</span>}
            {fotos.length > 1 && <>
              <Button size="icon" variant="secondary" aria-label="Foto anterior" onClick={() => setFoto((foto - 1 + fotos.length) % fotos.length)} className="absolute left-3 top-1/2 -translate-y-1/2"><ChevronLeft className="h-5 w-5" /></Button>
              <Button size="icon" variant="secondary" aria-label="Próxima foto" onClick={() => setFoto((foto + 1) % fotos.length)} className="absolute right-3 top-1/2 -translate-y-1/2"><ChevronRight className="h-5 w-5" /></Button>
            </>}
          </div>
          {fotos.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Miniaturas das fotos">
            {fotos.map((src, index) => <Button key={`${src}-${index}`} type="button" size="icon" variant="ghost" onClick={() => setFoto(index)} aria-label={`Ver foto ${index + 1}`} aria-pressed={foto === index} className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-card p-0 ${foto === index ? "border-accent" : "border-border"}`}><img src={src} alt="" loading="lazy" className="h-full w-full object-contain p-1" /></Button>)}
          </div>}
        </section>
        <section>
          <p className="text-xs font-semibold uppercase text-accent">{p.categoria} · Cód. {p.codigo ?? "—"}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{p.nome}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
          <div className="mt-7 border-y border-border py-5">
            {p.precoVista > 0 ? <><p className="text-sm text-muted-foreground">À vista</p><p className="text-4xl font-black">{brl(p.precoVista)}</p><p className="mt-1 text-sm text-accent">ou {PARCELAS}x de {brl(p.parcela)} no cartão</p></> : <p className="text-xl font-bold">Preço sob consulta</p>}
          </div>
          {p.cores.length > 0 && <fieldset className="mt-6"><legend className="mb-2 text-sm font-semibold">Cor: {cor}</legend><div className="flex flex-wrap gap-2">{p.cores.map((c) => {
            const disponivel = p.codigo ? estoque[`${p.codigo}:${c}`] : undefined;
            return <Button key={c} type="button" variant={cor === c ? "default" : "outline"} onClick={() => { setCor(c); setQuantidade(1); }} className={disponivel === 0 ? "opacity-60 line-through" : ""}>{c}{disponivel !== undefined && ` · ${disponivel} un.`}</Button>;
          })}</div></fieldset>}
          {p.tamanhos.length > 1 && <div className="mt-6"><label htmlFor="tamanho" className="mb-2 block text-sm font-semibold">Tamanho</label><select id="tamanho" value={tam} onChange={(e) => setTam(e.target.value)} className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-foreground">{p.tamanhos.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>}
          <p className={`mt-6 text-sm ${esgotado ? "font-semibold text-destructive" : "text-muted-foreground"}`}>{qtd === undefined ? "Estoque sob consulta" : esgotado ? "Esgotado nesta cor" : `Em estoque: ${qtd} ${qtd === 1 ? "unidade" : "unidades"}`}</p>
          {p.precoVista > 0 && !esgotado && <div className="mt-5 flex items-center gap-3"><label htmlFor="quantidade" className="text-sm font-medium">Quantidade</label><input id="quantidade" type="number" min="1" max={Math.min(qtd ?? 50, 50)} value={quantidade} onChange={(e) => setQuantidade(Math.max(1, Math.min(Number(e.target.value) || 1, qtd ?? 50, 50)))} className="w-20 rounded-md border border-border bg-secondary px-3 py-2 text-foreground" /></div>}
          {p.precoVista > 0 ? <Button className="mt-5 w-full gap-2" size="lg" disabled={esgotado} onClick={() => { add({ id: p.id, cor, tam }, quantidade); toast.success(`${p.nome} adicionado ao carrinho`); setOpen(true); }}><ShoppingBag className="h-4 w-4" />{esgotado ? "Esgotado" : "Adicionar ao carrinho"}</Button> : <Button asChild className="mt-5 w-full" size="lg"><a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Gostaria de consultar o preço de ${p.nome} (cód. ${p.codigo}).`)}`} target="_blank" rel="noopener noreferrer">Consultar preço no WhatsApp</a></Button>}
          <Link to="/" className="mt-6 inline-flex items-center gap-1 text-sm text-accent"><ChevronLeft className="h-4 w-4" /> Voltar aos produtos</Link>
        </section>
      </div>
    </main><SiteFooter />
  </div>;
}
