import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Truck } from "lucide-react";
import { useCart, FRETE_GRATIS_MIN } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { brl } from "@/lib/pricing";
import { useIsAdmin } from "@/lib/estoque";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  return (
    <>
      <div className="bg-accent px-4 py-1.5 text-center text-xs font-semibold text-accent-foreground">
        <Truck className="mr-1.5 inline h-3.5 w-3.5" />
        Frete grátis em compras acima de {brl(FRETE_GRATIS_MIN)}
      </div>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3">
          <Link to="/" className="mr-auto flex items-center gap-3">
            <img src="/marks-logo.png" alt="Marks Imports" className="h-11 w-11 rounded-lg object-cover" />
            <div className="hidden sm:block">
              <p className="text-base font-black tracking-[0.2em] text-foreground">MARKS IMPORTS</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Vitrine oficial</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/" className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
              Produtos
            </Link>
            <Link to="/contato" className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              Fale Conosco
            </Link>
            {isAdmin && (
              <Link to="/admin" className="rounded-lg px-3 py-2 font-semibold text-accent hover:text-foreground">
                Estoque
              </Link>
            )}
            <Link to={user ? "/conta" : "/auth"} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user ? "Minha conta" : "Entrar"}</span>
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir carrinho"
              className="relative flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {count}
                </span>
              )}
            </button>
          </nav>
          {children}
        </div>
      </header>
    </>
  );
}
