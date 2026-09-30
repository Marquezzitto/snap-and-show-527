import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Marks Imports" },
      { name: "description", content: "Entre ou crie sua conta Marks Imports para finalizar seus pedidos." },
      { property: "og:title", content: "Entrar — Marks Imports" },
      { property: "og:description", content: "Acesse sua conta Marks Imports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const input = "w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent";

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/conta" });
  }, [user, navigate]);

  async function google() {
    setCarregando(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) {
      toast.error("Não foi possível conectar com o Google. Crie uma conta ou entre com seu e-mail e senha abaixo.");
      setCarregando(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) toast.error("E-mail ou senha incorretos");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: nome } },
      });
      if (error) toast.error(error.message);
      else toast.success("Conta criada com sucesso! Você já pode entrar.");
    }
    setCarregando(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-14">
        <h1 className="text-3xl font-black text-foreground">{modo === "entrar" ? "Entrar" : "Criar conta"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Acesse com Google ou informe seus dados abaixo.</p>

        <button
          onClick={google}
          disabled={carregando}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-50"
        >
          <span className="font-black text-accent">G</span> Continuar com Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={enviar} className="space-y-3">
          {modo === "criar" && (
            <input required placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className={input} />
          )}
          <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          <input required type="password" minLength={6} placeholder="Senha (mínimo 6 dígitos)" value={senha} onChange={(e) => setSenha(e.target.value)} className={input} />
          <button disabled={carregando} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-60">
            {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar na minha conta" : "Criar minha conta"}
          </button>
        </form>

        <button onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")} className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground">
          {modo === "entrar" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>
      </main>
    </div>
  );
}
