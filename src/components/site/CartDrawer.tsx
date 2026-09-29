import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, FRETE_GRATIS_MIN } from "@/lib/cart";
import { brl } from "@/lib/pricing";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQtd, remove } = useCart();
  const navigate = useNavigate();
  const falta = Math.max(0, FRETE_GRATIS_MIN - subtotal);
  const pct = Math.min(100, (subtotal / FRETE_GRATIS_MIN) * 100);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle>Seu carrinho</SheetTitle>
        </SheetHeader>

        {lines.length > 0 && (
          <div className="border-b border-border p-5">
            <p className="text-xs text-muted-foreground">
              {falta > 0 ? (
                <>Faltam <b className="text-foreground">{brl(falta)}</b> para ganhar frete grátis</>
              ) : (
                <b className="text-accent">Você ganhou frete grátis!</b>
              )}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {lines.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">Seu carrinho está vazio.</p>}
          {lines.map((l) => (
            <div key={l.key} className="flex gap-3 rounded-xl border border-border bg-card p-3">
              <img src={l.produto.imagem ?? ""} alt={l.produto.nome} className="h-16 w-16 rounded-lg bg-secondary object-contain p-1" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{l.produto.nome}</p>
                <p className="truncate text-[11px] text-muted-foreground">{[l.cor, l.tam].filter(Boolean).join(" • ")}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-border">
                    <button aria-label="Diminuir" onClick={() => setQtd(l.key, l.qtd - 1)} className="p-1.5 text-muted-foreground hover:text-foreground"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-xs">{l.qtd}</span>
                    <button aria-label="Aumentar" onClick={() => setQtd(l.key, l.qtd + 1)} className="p-1.5 text-muted-foreground hover:text-foreground"><Plus className="h-3 w-3" /></button>
                  </div>
                  <p className="text-sm font-bold text-foreground">{brl(l.total)}</p>
                </div>
              </div>
              <button aria-label="Remover" onClick={() => remove(l.key)} className="self-start text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border p-5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><b className="text-foreground">{brl(subtotal)}</b></div>
            <p className="mt-1 text-[11px] text-muted-foreground">Frete calculado na finalização.</p>
            <button
              onClick={() => { setOpen(false); navigate({ to: "/checkout" }); }}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
