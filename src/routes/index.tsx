import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { produtos, type Produto } from "@/data/products";
import { brl, MARGEM_CATALOGO_1, MARGEM_CATALOGO_2, PARCELAS, TAXA_MAQUININHA } from "@/lib/pricing";

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

const WHATSAPP = "5511985978100";

function Card({ p }: { p: Produto }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_40px_-12px_var(--glow)]">
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        {p.imagem ? (
          <img
            src={p.imagem}
            alt={p.nome}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
            Foto em breve
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent backdrop-blur">
          {p.categoria}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-semibold leading-tight text-foreground">{p.nome}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.desc}</p>
        </div>

        <div className="mt-auto">
          <p className="text-xs text-muted-foreground">à vista</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{brl(p.precoVista)}</p>
          {p.parcela ? (
            <p className="text-xs text-accent">
              ou {PARCELAS}x de {brl(p.parcela)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">pagamento à vista</p>
          )}
        </div>

        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Tenho interesse no ${p.nome} (${brl(p.precoVista)}).`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Comprar
        </a>
      </div>
    </article>
  );
}

function Vitrine() {
  const [catalogo, setCatalogo] = useState<"todos" | 1 | 2>("todos");
  const [categoria, setCategoria] = useState("Todas");
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    return produtos.filter((p) => {
      if (catalogo !== "todos" && p.catalogo !== catalogo) return false;
      if (categoria !== "Todas" && p.categoria !== categoria) return false;
      if (busca && !`${p.nome} ${p.desc}`.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [catalogo, categoria, busca]);

  const cats = useMemo(
    () => ["Todas", ...Array.from(new Set(produtos.map((p) => p.categoria)))],
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4">
          <div className="mr-auto">
            <p className="text-lg font-black tracking-[0.2em] text-foreground">MARKS IMPORTS</p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Vitrine oficial 2026
            </p>
          </div>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent sm:w-64"
          />
        </div>
      </header>

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
            acessórios. Envio para todo o Brasil e parcelamento em até {PARCELAS}x.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-wrap items-center gap-2">
          {(["todos", 1, 2] as const).map((c) => (
            <button
              key={String(c)}
              onClick={() => setCatalogo(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                catalogo === c
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "todos" ? "Todos os catálogos" : c === 1 ? "Catálogo Premium" : "Catálogo Distribuidor"}
            </button>
          ))}
        </div>

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

      <footer className="mt-16 border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-10 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Marks Imports</p>
          <p className="mt-2">
            Preços do catálogo premium com margem de {Math.round(MARGEM_CATALOGO_1 * 100)}% e do
            catálogo distribuidor com margem de {Math.round(MARGEM_CATALOGO_2 * 100)}%. Parcelamento
            em {PARCELAS}x já inclui taxa de {(TAXA_MAQUININHA * 100).toFixed(1).replace(".", ",")}%
            da maquininha.
          </p>
          <p className="mt-2">(11) 98597-8100 • @spmarks_imports</p>
        </div>
      </footer>
    </div>
  );
}
