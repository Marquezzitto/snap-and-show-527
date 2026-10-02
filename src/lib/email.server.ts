export const EMAIL_LOJA = "marksimportssp@gmail.com";
const REMETENTE = "Marks Imports <noreply@marksimports.com.br>";

/** Envia e-mail para a loja via Resend. Retorna false se a chave não estiver configurada ou falhar. */
export async function enviarEmailLoja(assunto: string, html: string, replyTo?: string): Promise<boolean> {
  const key = process.env["RESEND_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!key || !lovableKey) {
    console.error("[email] Envio indisponível: conexão Resend ou autenticação da loja ausente");
    return false;
  }
  try {
    const r = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ from: REMETENTE, to: [EMAIL_LOJA], subject: assunto, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!r.ok) {
      console.error("[email] Resend", r.status, await r.text());
      return false;
    }
    const result = await r.json() as { id?: string; error?: string };
    if (result.error || !result.id) {
      console.error("[email] Resend não confirmou envio", result.error ?? "sem ID de envio");
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] erro", e);
    return false;
  }
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
