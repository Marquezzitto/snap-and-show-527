import { supabase } from "@/integrations/supabase/client";

export interface Perfil {
  nome: string; email: string; telefone: string; cep: string; rua: string; numero: string;
  complemento: string; bairro: string; cidade: string; estado: string;
}

export const perfilVazio: Perfil = { nome: "", email: "", telefone: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };

export async function carregarPerfil(userId: string, emailPadrao: string): Promise<Perfil> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  const p = { ...perfilVazio, ...(data ?? {}) } as Perfil;
  if (!p.email) p.email = emailPadrao;
  return p;
}

export function perfilCompleto(p: Perfil) {
  return [p.nome, p.email, p.telefone, p.cep, p.rua, p.numero, p.bairro, p.cidade, p.estado].every((v) => v.trim());
}

export async function buscarCep(cep: string) {
  const c = cep.replace(/\D/g, "");
  if (c.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
    const d = await r.json();
    if (d.erro) return null;
    return { rua: d.logradouro ?? "", bairro: d.bairro ?? "", cidade: d.localidade ?? "", estado: d.uf ?? "" };
  } catch {
    return null;
  }
}
