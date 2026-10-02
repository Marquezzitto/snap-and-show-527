import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  useCart,
  FRETE_GRATIS_MIN,
  type CartItem,
} from "@/lib/cart";
import { brl } from "@/lib/pricing";
import { useCatalog } from "@/lib/catalog";
import { getProductPhotos } from "@/data/productPhotos";
import { CatalogImage } from "@/components/site/CatalogImage";
import {
  carregarPerfil,
  perfilCompleto,
  type Perfil,
} from "@/lib/perfil";
import {
  calcularFrete,
  criarPedido,
} from "@/lib/pedido.functions";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido — Marks Imports" },
      {
        name: "description",
        content: "Revise seus itens e finalize o orçamento.",
      },
      {
        property: "og:title",
        content: "Finalizar pedido — Marks Imports",
      },
      {
        property: "og:description",
        content: "Revise seus itens e finalize o orçamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

interface Opcao {
  id: string;
  nome: string;
  preco: number;
  prazo: number;
}

function normalizarItens(items: CartItem[]) {
  return items.map((item) => ({
    id: item.id,
    cor: item.cor ?? "",
    tam: item.tam ?? "",
    qtd: item.qtd,
  }));
}

function Checkout() {
  const { overrides, ready } = useCatalog();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { lines, items, subtotal, clear } = useCart();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [disp, setDisp] = useState(true);
  const [freteId, setFreteId] = useState<string | null>(null);
  const [cotando, setCotando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const cotar = useServerFn(calcularFrete);
  const criar = useServerFn(criarPedido);

  const gratis = subtotal >= FRETE_GRATIS_MIN;

  useEffect(() => {
    carregarPerfil(user.id, user.email ?? "").then(setPerfil);
  }, [user.id, user.email]);

  useEffect(() => {
    if (!perfil?.cep || gratis || !items.length) {
      return;
    }

    setCotando(true);

    cotar({
      data: {
        cep: perfil.cep
          .replace(/\D/g, "")
          .replace(/(\d{5})(\d{3})/, "$1-$2"),

        itens: normalizarItens(items),
      },
    })
      .then((resultado) => {
        setOpcoes(resultado.opcoes);
        setDisp(resultado.disponivel);
        setFreteId(resultado.opcoes[0]?.id ?? null);
      })
      .catch(() => {
        setDisp(false);
      })
      .finally(() => {
        setCotando(false);
      });
  }, [perfil?.cep, gratis, items, cotar]);

  const frete = gratis
    ? 0
    : opcoes.find((opcao) => opcao.id === freteId)?.preco ?? null;

  async function finalizar() {
    if (!ready) { toast.error("Aguarde a atualização dos preços."); return; }
    setEnviando(true);

    try {
      const { numero, emailEnviado } = await criar({
        data: {
          itens: normalizarItens(items),
          freteId,
        },
      });

      clear();

      navigate({
        to: "/pedido/$numero",
        params: { numero },
      });
      if (!emailEnviado) toast.warning("Pedido salvo, mas o aviso por e-mail não foi enviado. Envie o número do pedido pelo WhatsApp da loja.", { duration: 12000 });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao finalizar",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!lines.length) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />

        <p className="py-24 text-center text-sm text-muted-foreground">
          Seu carrinho está vazio.{" "}
          <Link to="/" className="text-accent">
            Ver produtos
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto grid max-w-5xl gap-6 px-5 py-10 lg:grid-cols-[1fr_360px]">
        <section>
          <h1 className="text-3xl font-black text-foreground">
            Finalizar pedido
          </h1>

          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {lines.map((linha) => (
              <div
                key={linha.key}
                className="flex items-center gap-3 p-4"
              >
                <CatalogImage
                  src={getProductPhotos(linha.produto, overrides[linha.id]).colors[linha.cor] ?? getProductPhotos(linha.produto, overrides[linha.id]).gallery[0]}
                  alt={linha.produto.nome}
                  className="h-14 w-14 rounded-lg bg-secondary object-contain p-1"
                />

                <div className="flex-1 text-sm">
                  <p className="font-semibold text-foreground">
                    {linha.produto.nome}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {[linha.cor, linha.tam]
                      .filter(Boolean)
                      .join(" • ")}

                    {(linha.cor || linha.tam) && " • "}

                    {linha.qtd}x{" "}
                    {brl(linha.produto.precoVista)}
                  </p>
                </div>

                <p className="text-sm font-bold text-foreground">
                  {brl(linha.total)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">
                Entrega
              </p>

              <Link
                to="/conta"
                className="text-xs text-accent"
              >
                Editar cadastro
              </Link>
            </div>

            {perfil && perfilCompleto(perfil) ? (
              <p className="mt-2 text-muted-foreground">
                {perfil.nome} • {perfil.telefone}
                <br />
                {perfil.rua}, {perfil.numero}{" "}
                {perfil.complemento} — {perfil.bairro},{" "}
                {perfil.cidade}/{perfil.estado} — CEP{" "}
                {perfil.cep}
              </p>
            ) : (
              <p className="mt-2 text-muted-foreground">
                Complete sua ficha de cadastro, com nome,
                telefone e endereço, para calcular o frete.{" "}

                <Link
                  to="/conta"
                  className="text-accent"
                >
                  Preencher agora
                </Link>
              </p>
            )}

            {!gratis &&
              perfil &&
              perfilCompleto(perfil) && (
                <div className="mt-4 space-y-2">
                  {cotando && (
                    <p className="text-xs text-muted-foreground">
                      Calculando frete...
                    </p>
                  )}

                  {!cotando &&
                    opcoes.map((opcao) => (
                      <label
                        key={opcao.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${
                          freteId === opcao.id
                            ? "border-accent bg-accent/10"
                            : "border-border"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={freteId === opcao.id}
                            onChange={() =>
                              setFreteId(opcao.id)
                            }
                          />

                          {opcao.nome}

                          <span className="text-xs text-muted-foreground">
                            ({opcao.prazo} dias úteis)
                          </span>
                        </span>

                        <b className="text-foreground">
                          {brl(opcao.preco)}
                        </b>
                      </label>
                    ))}

                  {!cotando &&
                    (!disp || !opcoes.length) && (
                      <p className="text-xs text-muted-foreground">
                        O frete será calculado pela nossa
                        equipe e informado junto com o
                        orçamento.
                      </p>
                    )}
                </div>
              )}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5 text-sm lg:sticky lg:top-24">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span className="text-foreground">
              {brl(subtotal)}
            </span>
          </div>

          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">
              Frete
            </span>

            <span
              className={
                gratis
                  ? "font-semibold text-accent"
                  : "text-foreground"
              }
            >
              {gratis
                ? "Grátis"
                : frete === null
                  ? "A calcular"
                  : brl(frete)}
            </span>
          </div>

          {!gratis && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Faltam{" "}
              {brl(FRETE_GRATIS_MIN - subtotal)} para frete
              grátis.
            </p>
          )}

          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base">
            <b className="text-foreground">Total</b>

            <b className="text-foreground">
              {brl(subtotal + (frete ?? 0))}
            </b>
          </div>

          <button
            disabled={
              enviando ||
              !perfil ||
              !perfilCompleto(perfil)
            }
            onClick={finalizar}
            className="mt-5 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {enviando
              ? "Enviando..."
              : "Finalizar pedido"}
          </button>
        </aside>
      </main>
    </div>
  );
}
