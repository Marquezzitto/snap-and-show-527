import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { produtos, type Produto } from "@/data/products";
import { brl, PARCELAS } from "@/lib/pricing";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marks Imports — Vitrine de Smartwatches, Áudio e Óculos IA" },
      {
        name: "description",
        content:
          "Vitrine virtual com smartwatches Microwear e Wearzone, fones com ANC, óculos com IA e acessórios. Preços à vista e parcelados em 3x.",
      },
      { property: "og:title", content: "Marks Imports — Vitrine Oficial" },
      {
        property: "og:description",
        content: "Smartwatches, áudio Wearzone, óculos com IA e acessórios com preço à vista e em 3x.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Vitrine,
});

const COR_SWATCH: Record<string, string> = {
  Preto: "oklch(0.2 0 0)",
  Prata: "oklch(0.82 0.01 250)",
  Rosa: "oklch(0.8 0.08 10)",
  Dourado: "oklch(0.8 0.12 85)",
  Branco: "oklch(0.97 0 0)",
  Transparente: "linear-gradient(135deg, oklch(0.9 0 0 / .3), oklch(0.6 0 0 / .1))",
};

function Card({ p }: { p: Produto }) {
  const [cor, setCor] = useState(p.cores[0] ?? "");
  const [tam, setTam] = useState(p.tamanhos[0] ?? "");
  const { add, setOpen } = useCart();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_40px_-12px_var(--glow)]">
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        {p.imagem ? (
          <img src={p.imagem} alt={p.nome} loading="lazy" className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-muted-foreground">Foto em breve</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent backdrop-blur">
          {p.categoria}
        </span>
        {cor && p.cores.length > 1 && (
          <span
            key={cor}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur animate-in fade-in zoom-in-95 duration-300"
          >
            <span style={{ background: COR_SWATCH[cor] }} className="h-3 w-3 rounded-full border border-border" />
            {cor}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-semibold leading-tight text-foreground">{p.nome}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.tamanhos.length ? "Escolha o tamanho abaixo" : p.desc}</p>
        </div>

        {p.cores.length > 1 && (
          <fieldset>
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Escolha a cor
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {p.cores.map((c) => {
                const ativo = cor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setCor(c)}
                    className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs font-medium transition-all duration-200 active:scale-95 ${
                      ativo
                        ? "border-accent bg-accent/15 text-foreground shadow-[0_0_16px_-4px_var(--glow)]"
                        : "border-border bg-secondary text-muted-foreground hover:border-accent/50 hover:text-foreground"
                    }`}
                  >
                    <span
                      style={{ background: COR_SWATCH[c] }}
                      className={`flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] font-bold transition-transform ${ativo ? "scale-110" : ""}`}
                    >
                      {ativo && <span className="rounded-full bg-background/80 px-1 text-accent">✓</span>}
                    </span>
                    {c}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {p.tamanhos.length > 1 && (
          <select
            value={tam}
            onChange={(e) => setTam(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent"
          >
            {p.tamanhos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}

        <div className="mt-auto">
          <p className="text-xs text-muted-foreground">à vista</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{brl(p.precoVista)}</p>
          <p className="text-xs text-accent">ou {PARCELAS}x de {brl(p.parcela)}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            add({ id: p.id, cor, tam });
            toast.success(`${p.nome} adicionado ao carrinho`, { action: { label: "Ver carrinho", onClick: () => setOpen(true) } });
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
        >
          <ShoppingBag className="h-4 w-4" /> Adicionar ao carrinho
        </button>
      </div>
    </article>
  );
}

function Vitrine() {
  const [categoria, setCategoria] = useState("Todas");
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    return produtos.filter((p) => {
      if (categoria !== "Todas" && p.categoria !== categoria) return false;
      if (busca && !`${p.nome} ${p.desc}`.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [categoria, busca]);

  const cats = useMemo(
    () => ["Todas", ...Array.from(new Set(produtos.map((p) => p.categoria)))],
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent md:order-none md:w-64"
        />
      </SiteHeader>

      <section className="border-b border-border bg-gradient-to-b from-secondary/50 to-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Curadoria tecnológica
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-6xl">
            Eleve seu pulso.
            <span className="block bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Atualize seu tempo.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">
            Smartwatches Microwear e Wearzone, áudio com cancelamento de ruído, óculos com IA e
            acessórios. Envio para todo o Brasil, parcelamento em até {PARCELAS}x e frete grátis acima de R$ 420.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                categoria === c
                  ? "border-accent text-accent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">{lista.length} produtos</p>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {lista.map((p) => (
            <Card key={p.id} p={p} />
          ))}
        </div>

        {lista.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
