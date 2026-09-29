export const EMAIL_LOJA = "marksimportssp@gmail.com";

/**
 * Envia e-mail para a loja. Retorna false enquanto o domínio de envio
 * não estiver configurado (o pedido continua salvo normalmente).
 */
export async function enviarEmailLoja(assunto: string, html: string): Promise<boolean> {
  console.log(`[email pendente de configuração] Para: ${EMAIL_LOJA} | ${assunto}`, html.length);
  return false;
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
