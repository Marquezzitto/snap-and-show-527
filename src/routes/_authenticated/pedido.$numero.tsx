import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WHATSAPP } from "@/components/site/WhatsAppBubble";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/pedido/$numero")({
  head: () => ({ meta: [
    { title: "Pedido recebido — Marks Imports" },
    { name: "description", content: "Consulte o número do seu pedido Marks Imports." },
    { property: "og:title", content: "Pedido recebido — Marks Imports" },
    { property: "og:description", content: "Consulte o número do seu pedido Marks Imports." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Confirmacao,
});

function Confirmacao() {
  const { numero } = Route.useParams();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-20 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-accent" />
        <h1 className="mt-4 text-3xl font-black text-foreground">Pedido recebido!</h1>
        <p className="mt-3 text-sm text-muted-foreground">Número do seu pedido:</p>
        <p className="mt-1 break-all text-2xl font-black text-accent">{numero}</p>
        <p className="mt-4 text-sm text-muted-foreground">Este é o mesmo número enviado à loja por e-mail. Se você não receber uma resposta por e-mail, informe este número ao chamar no WhatsApp para acompanharmos seu pedido.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90">
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Fiz o pedido ${numero} pelo site da Marks Imports e gostaria de acompanhá-lo.`)}`} target="_blank" rel="noopener noreferrer">Enviar número pelo WhatsApp</a>
          </Button>
          <Link to="/" className="rounded-xl border border-border px-5 py-2.5 text-sm text-foreground">Continuar comprando</Link>
        </div>
      </main>
    </div>
  );
}
