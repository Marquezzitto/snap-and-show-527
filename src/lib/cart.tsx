import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import { produtos, type Produto } from "@/data/products";
import { useAuth } from "@/hooks/use-auth";
import {
  carregarCarrinho,
  salvarCarrinho,
} from "@/lib/cart.functions";

export const FRETE_GRATIS_MIN = 420;

export interface CartItem {
  id: string;
  cor: string;
  tam?: string;
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
  setOpen: (value: boolean) => void;
  add: (item: Omit<CartItem, "qtd">, qtd?: number) => void;
  setQtd: (key: string, qtd: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

const GUEST_STORAGE = "marks-cart-v2-guest";

function accountStorage(userId: string) {
  return `marks-cart-v2-user-${userId}`;
}

function keyOf(item: Pick<CartItem, "id" | "cor" | "tam">) {
  return `${item.id}|${item.cor ?? ""}|${item.tam ?? ""}`;
}

function normalizarItem(item: Partial<CartItem>): CartItem | null {
  if (
    typeof item.id !== "string" ||
    !item.id ||
    typeof item.qtd !== "number" ||
    !Number.isInteger(item.qtd) ||
    item.qtd <= 0
  ) {
    return null;
  }

  return {
    id: item.id,
    cor: typeof item.cor === "string" ? item.cor : "",
    tam: typeof item.tam === "string" ? item.tam : "",
    qtd: Math.min(item.qtd, 50),
  };
}

function normalizarCarrinho(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizarItem(item as Partial<CartItem>))
    .filter((item): item is CartItem => item !== null)
    .slice(0, 100);
}

function lerCarrinho(chave: string): CartItem[] {
  try {
    const raw = localStorage.getItem(chave);

    if (!raw) {
      return [];
    }

    return normalizarCarrinho(JSON.parse(raw));
  } catch {
    return [];
  }
}

function salvarCarrinhoLocal(chave: string, itens: CartItem[]) {
  try {
    localStorage.setItem(chave, JSON.stringify(itens));
  } catch {
    // Se o navegador bloquear o armazenamento local,
    // o carrinho continuará funcionando durante a sessão atual.
  }
}

function juntarCarrinhos(...carrinhos: CartItem[][]): CartItem[] {
  const resultado = new Map<string, CartItem>();

  for (const carrinho of carrinhos) {
    for (const item of normalizarCarrinho(carrinho)) {
      const key = keyOf(item);
      const existente = resultado.get(key);

      if (!existente) {
        resultado.set(key, item);
        continue;
      }

      resultado.set(key, {
        ...existente,
        qtd: Math.max(existente.qtd, item.qtd),
      });
    }
  }

  return Array.from(resultado.values());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const carregarRemoto = useServerFn(carregarCarrinho);
  const salvarRemoto = useServerFn(salvarCarrinho);

  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [escopoAtivo, setEscopoAtivo] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelado = false;

    async function prepararCarrinho() {
      if (!user) {
        const carrinhoVisitante = lerCarrinho(GUEST_STORAGE);

        if (!cancelado) {
          setItems(carrinhoVisitante);
          setEscopoAtivo("guest");
        }

        return;
      }

      const chaveUsuario = accountStorage(user.id);
      const carrinhoDesteNavegador = lerCarrinho(chaveUsuario);
      const carrinhoVisitante = lerCarrinho(GUEST_STORAGE);

      let carrinhoDoBanco: CartItem[] = [];

      try {
        const resposta = await carregarRemoto();
        carrinhoDoBanco = normalizarCarrinho(resposta.itens);
      } catch {
        // Se o banco estiver temporariamente indisponível,
        // mantém o carrinho local.
      }

      if (cancelado) {
        return;
      }

      const combinado = juntarCarrinhos(
        carrinhoDoBanco,
        carrinhoDesteNavegador,
        carrinhoVisitante,
      );

      setItems(combinado);
      salvarCarrinhoLocal(chaveUsuario, combinado);

      try {
        localStorage.removeItem(GUEST_STORAGE);
      } catch {
        // O navegador pode bloquear o armazenamento.
      }

      setEscopoAtivo(user.id);
    }

    void prepararCarrinho();

    return () => {
      cancelado = true;
    };
  }, [authLoading, user?.id, carregarRemoto]);

  useEffect(() => {
    if (!escopoAtivo) {
      return;
    }

    const chave =
      escopoAtivo === "guest"
        ? GUEST_STORAGE
        : accountStorage(escopoAtivo);

    salvarCarrinhoLocal(chave, items);

    if (!user || escopoAtivo !== user.id) {
      return;
    }

    const timer = window.setTimeout(() => {
      void salvarRemoto({
        data: {
          itens: items.map((item) => ({
            id: item.id,
            cor: item.cor ?? "",
            tam: item.tam ?? "",
            qtd: item.qtd,
          })),
        },
      }).catch(() => {
        // O carrinho permanece salvo neste navegador e uma próxima
        // alteração tentará sincronizar novamente.
      });
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [items, escopoAtivo, user?.id, salvarRemoto]);

  const value = useMemo<CartCtx>(() => {
    const lines: CartLine[] = items.flatMap((item) => {
      const produto = produtos.find((produto) => produto.id === item.id);

      if (!produto) {
        return [];
      }

      return [
        {
          ...item,
          cor: item.cor ?? "",
          tam: item.tam ?? "",
          key: keyOf(item),
          produto,
          total: produto.precoVista * item.qtd,
        },
      ];
    });

    return {
      items,

      lines,

      count: lines.reduce(
        (total, linha) => total + linha.qtd,
        0,
      ),

      subtotal: lines.reduce(
        (total, linha) => total + linha.total,
        0,
      ),

      open,

      setOpen,

      add: (item, qtd = 1) => {
        setItems((atuais) => {
          const itemNormalizado: CartItem = {
            id: item.id,
            cor: item.cor ?? "",
            tam: item.tam ?? "",
            qtd,
          };

          const key = keyOf(itemNormalizado);
          const existente = atuais.find(
            (atual) => keyOf(atual) === key,
          );

          if (existente) {
            return atuais.map((atual) =>
              keyOf(atual) === key
                ? {
                    ...atual,
                    qtd: Math.min(atual.qtd + qtd, 50),
                  }
                : atual,
            );
          }

          return [...atuais, itemNormalizado];
        });
      },

      setQtd: (key, qtd) => {
        setItems((atuais) =>
          qtd <= 0
            ? atuais.filter((item) => keyOf(item) !== key)
            : atuais.map((item) =>
                keyOf(item) === key
                  ? {
                      ...item,
                      qtd: Math.min(qtd, 50),
                    }
                  : item,
              ),
        );
      },

      remove: (key) => {
        setItems((atuais) =>
          atuais.filter((item) => keyOf(item) !== key),
        );
      },

      clear: () => {
        setItems([]);
      },
    };
  }, [items, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const cart = useContext(Ctx);

  if (!cart) {
    throw new Error("useCart fora do CartProvider");
  }

  return cart;
}
