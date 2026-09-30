export const EMAIL_LOJA = "marksimportssp@gmail.com";
const REMETENTE = "Marks Imports <noreply@marksimports.com.br>";

/** Envia e-mail para a loja via Resend. Retorna false se a chave não estiver configurada ou falhar. */
export async function enviarEmailLoja(assunto: string, html: string, replyTo?: string): Promise<boolean> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) {
    console.log(`[email sem RESEND_API_KEY] ${assunto}`);
    return false;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: REMETENTE, to: [EMAIL_LOJA], subject: assunto, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!r.ok) console.error("[email] Resend", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("[email] erro", e);
    return false;
  }
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
