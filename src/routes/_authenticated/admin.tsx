import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { produtos } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { useEstoque, useIsAdmin } from "@/lib/estoque";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração de estoque — Marks Imports" },
      { name: "description", content: "Área restrita para gerenciar o estoque da Marks Imports." },
      { property: "og:title", content: "Administração — Marks Imports" },
      { property: "og:description", content: "Área restrita de gerenciamento de estoque." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Linha({ codigo, nome, imagem, atual, onSalvo }: { codigo: string; nome: string; imagem: string | null; atual: number | undefined; onSalvo: () => void }) {
  const [valor, setValor] = useState(atual === undefined ? "" : String(atual));
  const [salvando, setSalvando] = useState(false);
  const mudou = valor !== (atual === undefined ? "" : String(atual));

  async function salvar() {
    setSalvando(true);
    const { error } =
      valor.trim() === ""
        ? await supabase.from("estoque").delete().eq("codigo", codigo)
        : await supabase.from("estoque").upsert({ codigo, quantidade: Math.max(0, parseInt(valor, 10) || 0), updated_at: new Date().toISOString() });
    setSalvando(false);
    if (error) return toast.error("Não foi possível salvar");
    toast.success(`Estoque de ${nome} atualizado`);
    onSalvo();
  }

  return (
    <tr className="border-b border-border">
      <td className="py-2 pr-3">
        <div className="flex items-center gap-3">
          {imagem && <img src={imagem} alt="" className="h-10 w-10 rounded bg-secondary object-contain" />}
          <div>
            <p className="text-sm font-medium text-foreground">{nome}</p>
            <p className="text-xs text-muted-foreground">Cód. {codigo}</p>
          </div>
        </div>
      </td>
      <td className="py-2 pr-3">
        {atual === undefined ? <span className="text-xs text-muted-foreground">Sem controle</span> : atual === 0 ? <span className="text-xs font-semibold text-destructive">Esgotado</span> : <span className="text-xs text-accent">{atual} un.</span>}
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={valor}
            placeholder="—"
            onChange={(e) => setValor(e.target.value)}
            className="w-20 rounded-lg border border-border bg-secondary px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          />
          <button
            disabled={!mudou || salvando}
            onClick={salvar}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </td>
    </tr>
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

  if (checking) return <div className="p-10 text-center text-muted-foreground">Carregando...</div>;
  if (!isAdmin)
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md p-10 text-center">
          <h1 className="text-xl font-bold text-foreground">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">Esta área é exclusiva do administrador da loja.</p>
          <Link to="/" className="mt-4 inline-block text-accent">Voltar à loja</Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Digite a quantidade e clique em Salvar. Com 0 o produto aparece como esgotado. Deixe vazio para não controlar estoque.
        </p>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou código..."
          className="mt-5 w-full rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        {loading ? (
          <p className="py-10 text-center text-muted-foreground">Carregando...</p>
        ) : (
          <table className="mt-4 w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2">Produto</th>
                <th className="py-2">Situação</th>
                <th className="py-2">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <Linha key={`${p.id}-${estoque[p.codigo!] ?? "x"}`} codigo={p.codigo!} nome={p.nome} imagem={p.imagem} atual={estoque[p.codigo!]} onSalvo={recarregar} />
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
