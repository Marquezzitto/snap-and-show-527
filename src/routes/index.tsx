import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { produtos, type Produto } from "@/data/products";
import { brl, PARCELAS } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import { useEstoque } from "@/lib/estoque";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppBubble } from "@/components/site/WhatsAppBubble";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marks Imports — Smartwatches, Wearzone e Acessórios" },
      { name: "description", content: "Catálogo completo Marks Imports. Smartwatches, fones e acessórios em até 3x sem juros ou desconto à vista." },
      { property: "og:title", content: "Marks Imports — Vitrine Oficial" },
      { property: "og:description", content: "Smartwatches, fones e acessórios premium com pronta entrega." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Vitrine,
});

const COR_SWATCH: Record<string, string> = {
  Preto: "#1a1a1a",
  Branco: "#f5f5f5",
  Prata: "#c0c0c0",
  Dourado: "#d4af37",
  Rosa: "#f472b6",
  "Rosa Claro": "#fbcfe8",
  "Rosa Pink": "#db2777",
  Rosé: "#e0a899",
  "Rose Gold": "#b76e79",
  Laranja: "#ea580c",
  Verde: "#16a34a",
  "Verde Militar": "#4b5320",
  "Verde Petróleo": "#005f73",
  Azul: "#2563eb",
  "Azul Marinho": "#1e3a8a",
  Turquesa: "#06b6d4",
  Cinza: "#64748b",
  Grafite: "#334155",
  Marrom: "#78350f",
  Caramelo: "#c2410c",
  Café: "#3e2723",
  Bege: "#d2b48c",
  Nude: "#e5c29f",
  Mostarda: "#ca8a04",
  Lilás: "#c084fc",
  Roxo: "#7e22ce",
  Vinho: "#831843",
  Vermelho: "#dc2626",
  Amarelo: "#eab308",
  Starlight: "#f0e6d2",
  Titanium: "#878681",
};

function ProdutoCard({ p, estoque }: { p: Produto; estoque: Record<string, number> }) {
  const { add, setOpen } = useCart();
  const [cor, setCor] = useState<string | undefined>(p.cores[0]);
  const [tam, setTam] = useState<string | undefined>(p.tamanhos[0]);

  // Chave de estoque: "codigo:cor" ou apenas "codigo" se não tiver cor
  const chaveEstoque = p.codigo ? (cor ? `${p.codigo}:${cor}` : p.codigo) : "";
  const chaveGeral = p.codigo ?? "";
  
  // Prioridade: estoque da cor selecionada; se não definido, usa o geral do produto
  const qtd = chaveEstoque && estoque[chaveEstoque] !== undefined
    ? estoque[chaveEstoque]
    : chaveGeral && estoque[chaveGeral] !== undefined
    ? estoque[chaveGeral]
    : undefined;

  const esgotado = qtd !== undefined && qtd <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent/40 hover:shadow-xl">
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        {p.imagem ? (
          <img src={p.imagem} alt={p.nome} loading="lazy" className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem foto</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] font-semibold text-accent backdrop-blur">
          {p.categoria}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-bold text-foreground">{p.nome}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">{p.desc}</p>
        </div>

        {p.cores.length > 0 && (
          <fieldset className="space-y-1.5">
            <legend className="text-xs font-medium text-muted-foreground">
              Cor: <span className="font-semibold text-foreground">{cor ?? "Selecione"}</span>
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {p.cores.map((c) => {
                const ativo = cor === c;
                const chaveC = p.codigo ? `${p.codigo}:${c}` : "";
                const qtdC = chaveC && estoque[chaveC] !== undefined ? estoque[chaveC] : undefined;
                const corEsgotada = qtdC !== undefined && qtdC <= 0;

                return (
                  <Button
                    key={c}
                    type="button"
                    variant="outline"
                    onClick={() => setCor(c)}
                    className={`h-auto min-h-8 gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium transition-all ${
                      ativo
                        ? "border-accent bg-accent/15 text-foreground shadow-sm"
                        : "border-border bg-secondary text-muted-foreground hover:border-accent/50 hover:text-foreground"
                    } ${corEsgotada ? "opacity-50 line-through" : ""}`}
                  >
                    <span
                      style={{ background: COR_SWATCH[c] ?? "#555" }}
                      className={`flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px] font-bold ${ativo ? "scale-110 ring-1 ring-accent" : ""}`}
                    >
                      {ativo && <span className="text-white">✓</span>}
                    </span>
                    {c}
                  </Button>
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

        {/* Informação visível do estoque para o cliente */}
        <div className="text-xs">
          {qtd === undefined ? (
            <span className="text-muted-foreground">✓ Disponível para envio</span>
          ) : esgotado ? (
            <span className="font-bold text-destructive">Esgotado nesta cor</span>
          ) : qtd <= 5 ? (
            <span className="font-bold text-accent">Últimas {qtd} unidades em estoque!</span>
          ) : (
            <span className="text-muted-foreground">Em estoque: <strong className="text-foreground">{qtd} un.</strong></span>
          )}
        </div>

        <div className="mt-auto pt-2">
          <p className="text-xs text-muted-foreground">à vista</p>
          <p className="text-2xl font-black text-foreground">{brl(p.precoVista)}</p>
          <p className="text-xs text-accent">ou {PARCELAS}x de {brl(p.parcela)} no cartão</p>
        </div>

        <Button
          type="button"
          disabled={esgotado}
          onClick={() => {
            add({ id: p.id, cor: cor ?? "", tam: tam ?? "" });
            toast.success(`${p.nome} adicionado ao carrinho`, { action: { label: "Ver carrinho", onClick: () => setOpen(true) } });
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingBag className="h-4 w-4" /> {esgotado ? "Esgotado" : "Adicionar ao carrinho"}
        </Button>
      </div>
    </article>
  );
}

function Vitrine() {
  const [busca, setBusca] = useState("");
  const { estoque } = useEstoque();

  const lista = useMemo(() => {
    return produtos.filter((p) => {
      if (busca && !`${p.nome} ${p.desc}`.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [busca]);

  const cats = useMemo(
    () => Array.from(new Set(produtos.map((p) => p.categoria))),
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-border bg-gradient-to-b from-card/60 to-background py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Catálogo Marks Imports</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Smartwatches, kits, pulseiras e acessórios com frete grátis para todo o Brasil acima de R$ 420.
          </p>
          <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, modelo ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Categorias" className="mb-8 flex gap-2 overflow-x-auto border-b border-border pb-4">
          {cats.map((c) => (
            <a
              key={c}
              href={`#${c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`}
              className="shrink-0 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-accent"
            >
              {c}
            </a>
          ))}
        </nav>

        <p className="mb-4 text-xs text-muted-foreground">Exibindo {lista.length} produtos</p>

        {cats.map((c) => {
          const itens = lista.filter((p) => p.categoria === c);
          if (!itens.length) return null;
          return <section key={c} id={c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-28 border-t border-border py-9 first:border-0 first:pt-0">
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h2 className="text-2xl font-bold text-foreground">{c}</h2>
              <span className="text-xs text-muted-foreground">{itens.length} {itens.length === 1 ? "produto" : "produtos"}</span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {itens.map((p) => <ProdutoCard key={p.id} p={p} estoque={estoque} />)}
            </div>
          </section>;
        })}
        {lista.length === 0 && <p className="py-10 text-center text-muted-foreground">Nenhum produto encontrado.</p>}
      </main>

      <WhatsAppBubble />
      <SiteFooter />
    </div>
  );
}
