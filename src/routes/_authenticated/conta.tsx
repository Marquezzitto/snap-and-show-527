import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { buscarCep, carregarPerfil, perfilVazio, type Perfil } from "@/lib/perfil";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/pricing";
import { useFavorites } from "@/lib/favorites";
import { useCatalog } from "@/lib/catalog";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [
    { title: "Minha conta — Marks Imports" },
    { name: "description", content: "Seu cadastro e seus pedidos na Marks Imports." },
    { property: "og:title", content: "Minha conta — Marks Imports" },
    { property: "og:description", content: "Seu cadastro e seus pedidos na Marks Imports." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Conta,
});

const input = "w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent";

interface Pedido { numero: string; total: number; created_at: string; frete: number | null }

function Conta() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { count } = useCart();
  const { favorites } = useFavorites();
  const { products } = useCatalog();
  const [p, setP] = useState<Perfil>(perfilVazio);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPerfil(user.id, user.email ?? "").then(setP);
    supabase.from("orders").select("numero,total,created_at,frete").order("created_at", { ascending: false }).then(({ data }) => setPedidos((data as Pedido[]) ?? []));
  }, [user.id, user.email]);

  const set = (k: keyof Perfil) => (e: React.ChangeEvent<HTMLInputElement>) => setP((v) => ({ ...v, [k]: e.target.value }));

  async function onCep(cep: string) {
    setP((v) => ({ ...v, cep }));
    const end = await buscarCep(cep);
    if (end) setP((v) => ({ ...v, ...end }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...p, updated_at: new Date().toISOString() });
    setSalvando(false);
    if (error) { toast.error("Não foi possível salvar"); return; }
    toast.success("Cadastro salvo!");
    if (count > 0) navigate({ to: "/checkout" });
  }

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-foreground">Minha conta</h1>
          <button onClick={sair} className="text-xs text-muted-foreground hover:text-foreground">Sair</button>
        </div>
        <form onSubmit={salvar} className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-6">
          <p className="text-sm font-semibold text-foreground sm:col-span-6">Ficha de cadastro</p>
          <input required placeholder="Nome completo" value={p.nome} onChange={set("nome")} className={`${input} sm:col-span-6`} />
          <input required type="email" placeholder="E-mail" value={p.email} onChange={set("email")} className={`${input} sm:col-span-3`} />
          <input required placeholder="Telefone / WhatsApp" value={p.telefone} onChange={set("telefone")} className={`${input} sm:col-span-3`} />
          <input required placeholder="CEP" value={p.cep} onChange={(e) => onCep(e.target.value)} className={`${input} sm:col-span-2`} />
          <input required placeholder="Rua" value={p.rua} onChange={set("rua")} className={`${input} sm:col-span-4`} />
          <input required placeholder="Número" value={p.numero} onChange={set("numero")} className={`${input} sm:col-span-2`} />
          <input placeholder="Complemento" value={p.complemento} onChange={set("complemento")} className={`${input} sm:col-span-4`} />
          <input required placeholder="Bairro" value={p.bairro} onChange={set("bairro")} className={`${input} sm:col-span-2`} />
          <input required placeholder="Cidade" value={p.cidade} onChange={set("cidade")} className={`${input} sm:col-span-3`} />
          <input required placeholder="UF" maxLength={2} value={p.estado} onChange={set("estado")} className={`${input} sm:col-span-1`} />
          <button disabled={salvando} className="rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-60 sm:col-span-6">
            {salvando ? "Salvando..." : count > 0 ? "Salvar e continuar para o pedido" : "Salvar cadastro"}
          </button>
        </form>
        <section className="mt-9 rounded-2xl border border-border bg-card p-5"><h2 className="text-lg font-bold text-foreground">Favoritos</h2>{products.filter((item) => favorites.includes(item.id)).length ? <ul className="mt-3 space-y-3">{products.filter((item) => favorites.includes(item.id)).map((item) => <li key={item.id}><Link to="/produto/$productId" params={{ productId: item.id }} className="text-accent underline">{item.nome}</Link></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Você ainda não favoritou produtos.</p>}</section>

        <h2 className="mt-10 text-lg font-bold text-foreground">Meus orçamentos</h2>
        {pedidos.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhum pedido ainda.</p>
        ) : (
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {pedidos.map((o) => (
              <div key={o.numero} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground">{o.numero}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <p className="font-bold text-foreground">{brl(Number(o.total))}{o.frete === null && <span className="ml-1 text-xs font-normal text-muted-foreground">+ frete</span>}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
