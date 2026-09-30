import { Link } from "@tanstack/react-router";
import { MARGEM, PARCELAS, TAXA_MAQUININHA } from "@/lib/pricing";

export function SiteFooter() {
  void MARGEM;
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 text-xs text-muted-foreground sm:grid-cols-3">
        <div>
          <img src="/marks-logo.png" alt="Marks Imports" className="h-16 w-16 rounded-xl object-cover" />
          <p className="mt-3">Parcelamento em {PARCELAS}x com taxa de {(TAXA_MAQUININHA * 100).toFixed(0)}% da maquininha.</p>
          <p className="mt-1">Frete grátis acima de R$ 420,00.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Atendimento</p>
          <p className="mt-2">WhatsApp: (11) 98597-8100</p>
          <p>E-mail: marksimportssp@gmail.com</p>
          <p>Instagram: @spmarks_imports</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-foreground">Links</p>
          <Link to="/" className="hover:text-foreground">Produtos</Link>
          <Link to="/contato" className="hover:text-foreground">Fale Conosco</Link>
          <Link to="/conta" className="hover:text-foreground">Minha conta</Link>
        </div>
      </div>
    </footer>
  );
}
