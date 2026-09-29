import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { produtos, type Produto } from "@/data/products";

export const FRETE_GRATIS_MIN = 420;

export interface CartItem {
  id: string;
  cor: string;
  tam: string;
  qtd: number;
}

export interface CartLine extends CartItem {
  key: string;
  produto: Produto;
  total: number;
}

interface CartCtx {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "qtd">, qtd?: number) => void;
  setQtd: (key: string, qtd: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "marks-cart-v1";
const keyOf = (i: Pick<CartItem, "id" | "cor" | "tam">) => `${i.id}|${i.cor}|${i.tam}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items, loaded]);

  const value = useMemo<CartCtx>(() => {
    const lines: CartLine[] = items.flatMap((i) => {
      const produto = produtos.find((p) => p.id === i.id);
      return produto ? [{ ...i, key: keyOf(i), produto, total: produto.precoVista * i.qtd }] : [];
    });
    return {
      items,
      lines,
      count: lines.reduce((s, l) => s + l.qtd, 0),
      subtotal: lines.reduce((s, l) => s + l.total, 0),
      open,
      setOpen,
      add: (item, qtd = 1) =>
        setItems((prev) => {
          const k = keyOf(item);
          const ex = prev.find((p) => keyOf(p) === k);
          return ex
            ? prev.map((p) => (keyOf(p) === k ? { ...p, qtd: p.qtd + qtd } : p))
            : [...prev, { ...item, qtd }];
        }),
      setQtd: (key, qtd) =>
        setItems((prev) =>
          qtd <= 0 ? prev.filter((p) => keyOf(p) !== key) : prev.map((p) => (keyOf(p) === key ? { ...p, qtd } : p)),
        ),
      remove: (key) => setItems((prev) => prev.filter((p) => keyOf(p) !== key)),
      clear: () => setItems([]),
    };
  }, [items, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart fora do CartProvider");
  return c;
}
