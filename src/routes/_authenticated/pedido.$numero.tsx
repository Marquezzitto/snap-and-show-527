import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WHATSAPP } from "@/components/site/WhatsAppBubble";

export const Route = createFileRoute("/_authenticated/pedido/$numero")({
  head: () => ({ meta: [{ title: "Orçamento enviado — Marks Imports" }, { name: "description", content: "Seu orçamento foi recebido." }] }),
  component: Confirmacao,
});

function Confirmacao() {
  const { numero } = Route.useParams();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-20 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-accent" />
        <h1 className="mt-4 text-3xl font-black text-foreground">Orçamento recebido!</h1>
        <p className="mt-3 text-sm text-muted-foreground">Número do seu orçamento:</p>
        <p className="mt-1 text-2xl font-black tracking-widest text-accent">{numero}</p>
        <p className="mt-4 text-sm text-muted-foreground">Nossa equipe vai entrar em contato em breve para confirmar pagamento e envio.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Acabei de enviar o orçamento ${numero} pelo site.`)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-whatsapp px-5 py-2.5 text-sm font-semibold text-whatsapp-foreground">Falar no WhatsApp</a>
          <Link to="/" className="rounded-xl border border-border px-5 py-2.5 text-sm text-foreground">Continuar comprando</Link>
        </div>
      </main>
    </div>
  );
}
