import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Grid2X2, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useCatalog } from "@/lib/catalog";

export function MobileNav() {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const { setOpen, count } = useCart();
  const { products } = useCatalog();
  const navigate = useNavigate();
  const results = query.trim() ? products.filter((p) => `${p.nome} ${p.categoria} ${p.codigo ?? ""}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  return <div className="md:hidden">
    {searching && <div className="fixed inset-x-0 bottom-16 z-50 max-h-[65vh] overflow-y-auto border-t border-border bg-background p-4 shadow-xl">
      <label htmlFor="mobile-search" className="text-sm font-semibold">Buscar produtos</label>
      <input id="mobile-search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome ou categoria" className="mt-2 w-full rounded-md border border-border bg-secondary p-3 text-base" />
      {query && <Button variant="ghost" size="sm" onClick={() => setQuery("")}>Limpar</Button>}
      {query && results.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nenhum produto encontrado.</p>}
      {results.map((p) => <Button key={p.id} variant="ghost" className="flex h-auto w-full justify-start py-3 text-left" onClick={() => { setSearching(false); setQuery(""); navigate({ to: "/produto/$productId", params: { productId: p.id } }); }}>{p.nome}</Button>)}
    </div>}
    <nav aria-label="Navegação mobile" className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-5 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      <Link to="/" className="flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground"><Home className="h-5 w-5" />Início</Link>
      <Link to="/categorias" className="flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground"><Grid2X2 className="h-5 w-5" />Categorias</Link>
      <Button variant="ghost" aria-label="Buscar" onClick={() => setSearching(!searching)} className="flex h-full flex-col gap-1 rounded-none text-[10px] text-muted-foreground"><Search className="h-5 w-5" />Buscar</Button>
      <Button variant="ghost" aria-label="Carrinho" onClick={() => setOpen(true)} className="flex h-full flex-col gap-1 rounded-none text-[10px] text-muted-foreground"><ShoppingBag className="h-5 w-5" />Carrinho{count > 0 ? ` (${count})` : ""}</Button>
      <Link to="/conta" className="flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground"><User className="h-5 w-5" />Conta</Link>
    </nav>
  </div>;
}
