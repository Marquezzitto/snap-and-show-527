import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { produtos, type Produto } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { useEstoque, useIsAdmin } from "@/lib/estoque";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração de estoque — Marks Imports" },
      { name: "description", content: "Gerencie o estoque dos produtos Marks Imports por cor." },
      { property: "og:title", content: "Administração de estoque — Marks Imports" },
      { property: "og:description", content: "Gerencie o estoque dos produtos Marks Imports por cor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function LinhaEstoque({
  chave,
  rotulo,
  atual,
  onSalvo,
}: {
  chave: string;
  rotulo: string;
  atual: number | undefined;
  onSalvo: () => void;
}) {
  const [valor, setValor] = useState(atual === undefined ? "" : String(atual));
  const [salvando, setSalvando] = useState(false);
  const mudou = valor !== (atual === undefined ? "" : String(atual));

  async function salvar() {
    setSalvando(true);
    const { error } =
      valor.trim() === ""
        ? await supabase.from("estoque").delete().eq("codigo", chave)
        : await supabase.from("estoque").upsert({
            codigo: chave,
            quantidade: Math.max(0, parseInt(valor, 10) || 0),
            updated_at: new Date().toISOString(),
          });
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar o estoque");
      return;
    }
    toast.success(`Estoque atualizado: ${rotulo}`);
    onSalvo();
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/40 py-1.5 text-xs">
      <span className="font-medium text-foreground">{rotulo}</span>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {atual === undefined ? "Livre" : atual === 0 ? "Esgotado" : `${atual} un.`}
        </span>
        <input
          type="number"
          min={0}
          value={valor}
          placeholder="Livre"
          onChange={(e) => setValor(e.target.value)}
          className="w-16 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-foreground outline-none focus:border-accent"
        />
        <button
          disabled={!mudou || salvando}
          onClick={salvar}
          className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-30"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

function CardProdutoAdmin({ p, estoque, onSalvo }: { p: Produto; estoque: Record<string, number>; onSalvo: () => void }) {
  if (!p.codigo) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        {p.imagem && <img src={p.imagem} alt="" className="h-12 w-12 rounded-lg bg-secondary object-contain p-1" />}
        <div>
          <h3 className="text-sm font-bold text-foreground">{p.nome}</h3>
          <p className="text-xs text-muted-foreground">Cód: {p.codigo} — {p.categoria}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {p.cores.length > 0 ? (
          p.cores.map((cor) => {
            const chave = `${p.codigo}:${cor}`;
            return (
              <LinhaEstoque
                key={chave}
                chave={chave}
                rotulo={`Cor: ${cor}`}
                atual={estoque[chave]}
                onSalvo={onSalvo}
              />
            );
          })
        ) : (
          <LinhaEstoque
            chave={p.codigo}
            rotulo="Estoque geral"
            atual={estoque[p.codigo]}
            onSalvo={onSalvo}
          />
        )}
      </div>
    </div>
  );
}

function Admin() {
  const { isAdmin, checking } = useIsAdmin();
  const { estoque, loading, recarregar } = useEstoque();
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () => produtos.filter((p) => p.codigo && `${p.nome} ${p.codigo}`.toLowerCase().includes(busca.toLowerCase())),
    [busca],
  );

  if (checking || loading) return <div className="p-12 text-center text-muted-foreground">Carregando estoque...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md p-10 text-center">
          <h1 className="text-xl font-bold text-foreground">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre com a conta marksimportssp@gmail.com para gerenciar o estoque.</p>
          <Link to="/" className="mt-4 inline-block text-accent">Voltar à loja</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black">Gerenciador de Estoque por Variação</h1>
            <p className="text-xs text-muted-foreground">Defina a quantidade exata de cada cor. Deixe em branco se não quiser limitar.</p>
          </div>
          <input
            type="text"
            placeholder="Filtrar por nome ou código..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {lista.map((p) => (
            <CardProdutoAdmin key={p.id} p={p} estoque={estoque} onSalvo={recarregar} />
          ))}
        </div>
      </main>
    </div>
  );
}
