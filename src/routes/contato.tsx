import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WHATSAPP } from "@/components/site/WhatsAppBubble";
import { enviarContato } from "@/lib/pedido.functions";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Fale Conosco — Marks Imports" },
      { name: "description", content: "Fale com a Marks Imports por e-mail, WhatsApp ou pelo formulário de contato." },
      { property: "og:title", content: "Fale Conosco — Marks Imports" },
      { property: "og:description", content: "Tire dúvidas, peça orçamentos e fale com nossa equipe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contato,
});

const ASSUNTOS = ["Dúvida", "Orçamento", "Troca e devolução", "Pedido", "Outro"] as const;
const input = "w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent";

function Contato() {
  const enviar = useServerFn(enviarContato);
  const [f, setF] = useState({ nome: "", email: "", telefone: "", assunto: "Dúvida" as (typeof ASSUNTOS)[number], mensagem: "" });
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const resultado = await enviar({ data: f });
      if (resultado.emailEnviado) toast.success("Mensagem enviada! Responderemos em breve.");
      else toast.warning("Mensagem registrada, mas o aviso por e-mail não foi enviado. Fale conosco pelo WhatsApp.", { duration: 12000 });
      setF({ nome: "", email: "", telefone: "", assunto: "Dúvida", mensagem: "" });
    } catch {
      toast.error("Confira os campos e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-8 px-5 py-12 md:grid-cols-[1fr_1.4fr]">
        <section>
          <h1 className="text-3xl font-black text-foreground">Fale Conosco</h1>
          <p className="mt-3 text-sm text-muted-foreground">Estamos prontos para ajudar com dúvidas, orçamentos, trocas e pedidos.</p>
          <div className="mt-6 space-y-3">
            <a href="mailto:marksimportssp@gmail.com" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-accent">
              <Mail className="h-5 w-5 text-accent" />
              <div><p className="text-xs text-muted-foreground">E-mail</p><p className="text-sm font-semibold text-foreground">marksimportssp@gmail.com</p></div>
            </a>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-accent">
              <MessageCircle className="h-5 w-5 text-whatsapp" />
              <div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="text-sm font-semibold text-foreground">(11) 98597-8100</p></div>
            </a>
          </div>
        </section>
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <input required placeholder="Nome" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={input} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input required type="email" placeholder="E-mail" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={input} />
            <input placeholder="Telefone" value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} className={input} />
          </div>
          <select value={f.assunto} onChange={(e) => setF({ ...f, assunto: e.target.value as (typeof ASSUNTOS)[number] })} className={input}>
            {ASSUNTOS.map((a) => <option key={a}>{a}</option>)}
          </select>
          <textarea required minLength={5} rows={5} placeholder="Sua mensagem" value={f.mensagem} onChange={(e) => setF({ ...f, mensagem: e.target.value })} className={input} />
          <button disabled={enviando} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-60">
            {enviando ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
