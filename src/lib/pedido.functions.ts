import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { produtos } from "@/data/products";
import { brl } from "@/lib/pricing";
import { cotarFrete } from "./frete.server";
import { enviarEmailLoja, esc } from "./email.server";

const FRETE_GRATIS_MIN = 420;

const tamanhoOpcional = z.preprocess(
  (valor) => (typeof valor === "string" ? valor : ""),
  z.string().max(120),
);

const itensSchema = z
  .array(
    z.object({
      id: z.string().max(60),
      cor: z.string().max(40),
      tam: tamanhoOpcional,
      qtd: z.number().int().min(1).max(50),
    }),
  )
  .min(1)
  .max(60);

function calcular(itens: z.infer<typeof itensSchema>) {
  const linhas = itens.flatMap((i) => {
    const p = produtos.find((x) => x.id === i.id);

    return p
      ? [
          {
            nome: p.nome,
            codigo: p.codigo ?? "",
            cor: i.cor,
            tam: i.tam,
            qtd: i.qtd,
            unit: p.precoVista,
            total: p.precoVista * i.qtd,
          },
        ]
      : [];
  });

  const subtotal = linhas.reduce((s, l) => s + l.total, 0);
  const qtd = linhas.reduce((s, l) => s + l.qtd, 0);

  return { linhas, subtotal, qtd };
}

export const calcularFrete = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        cep: z.string().regex(/^\d{5}-?\d{3}$/),
        itens: itensSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { subtotal, qtd } = calcular(data.itens);

    if (subtotal >= FRETE_GRATIS_MIN) {
      return {
        gratis: true,
        opcoes: [],
        disponivel: true,
      };
    }

    const opcoes = await cotarFrete(data.cep, qtd, subtotal);

    return {
      gratis: false,
      opcoes: opcoes ?? [],
      disponivel: opcoes !== null,
    };
  });

function gerarNumero() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));

  return (
    "MK-" +
    Array.from(bytes, (b) => chars[b % chars.length]).join("")
  );
}

export const criarPedido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        itens: itensSchema,
        freteId: z.string().max(20).nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: perfil, error: pe } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();

    if (pe || !perfil) {
      throw new Error("Cadastro não encontrado");
    }

    const obrig = [
      perfil.nome,
      perfil.email,
      perfil.telefone,
      perfil.cep,
      perfil.rua,
      perfil.numero,
      perfil.cidade,
      perfil.estado,
    ];

    if (obrig.some((v) => !v?.trim())) {
      throw new Error("Complete seu cadastro antes de finalizar");
    }

    const { linhas, subtotal, qtd } = calcular(data.itens);

    if (!linhas.length) {
      throw new Error("Carrinho vazio");
    }

    // O estoque pode ser geral ou separado por cor; produto sem registro não é limitado.
    const pedidoPorCodigo = new Map<string, number>();
    const pedidoPorCor = new Map<string, number>();

    for (const l of linhas) {
      if (l.codigo) {
        pedidoPorCodigo.set(
          l.codigo,
          (pedidoPorCodigo.get(l.codigo) ?? 0) + l.qtd,
        );
        if (l.cor) {
          const chave = `${l.codigo}:${l.cor}`;
          pedidoPorCor.set(chave, (pedidoPorCor.get(chave) ?? 0) + l.qtd);
        }
      }
    }

    const chaves = [...new Set([...pedidoPorCodigo.keys(), ...pedidoPorCor.keys()])];
    const { data: est, error: erroEstoque } = chaves.length
      ? await context.supabase.from("estoque").select("codigo, quantidade").in("codigo", chaves)
      : { data: [], error: null };
    if (erroEstoque) throw new Error("Não foi possível conferir o estoque. Tente novamente.");
    const codigosComCor = new Set((est ?? []).filter((e) => pedidoPorCor.has(e.codigo)).map((e) => e.codigo.split(":")[0]));

    for (const e of est ?? []) {
      const necessario = pedidoPorCor.get(e.codigo) ?? (codigosComCor.has(e.codigo) ? 0 : pedidoPorCodigo.get(e.codigo) ?? 0);
      if (necessario > e.quantidade) {
        const nome =
          linhas.find((l) => e.codigo === l.codigo || e.codigo === `${l.codigo}:${l.cor}`)?.nome ?? e.codigo;

        throw new Error(
          e.quantidade > 0
            ? `${nome}: só temos ${e.quantidade} em estoque`
            : `${nome} está esgotado`,
        );
      }
    }

    let frete: number | null = 0;
    let freteServico: string | null = "Grátis (acima de R$ 420)";

    if (subtotal < FRETE_GRATIS_MIN) {
      const opcoes = await cotarFrete(perfil.cep, qtd, subtotal);
      const escolhida =
        opcoes?.find((o) => o.id === data.freteId) ?? null;

      frete = escolhida ? escolhida.preco : null;
      freteServico = escolhida
        ? `${escolhida.nome} (${escolhida.prazo} dias úteis)`
        : "A calcular";
    }

    const total = subtotal + (frete ?? 0);

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const cliente = {
      nome: perfil.nome,
      email: perfil.email,
      telefone: perfil.telefone,
      endereco: `${perfil.rua}, ${perfil.numero}${
        perfil.complemento ? " - " + perfil.complemento : ""
      }, ${perfil.bairro}, ${perfil.cidade}/${perfil.estado} - CEP ${
        perfil.cep
      }`,
    };

    let numero = "";

    for (let t = 0; t < 5; t++) {
      numero = gerarNumero();

      const { error } = await supabaseAdmin.from("orders").insert({
        numero,
        user_id: context.userId,
        cliente,
        itens: linhas,
        subtotal,
        frete,
        frete_servico: freteServico,
        total,
      });

      if (!error) break;

      if (!error.message.includes("duplicate")) {
        throw new Error("Não foi possível salvar o pedido");
      }

      numero = "";
    }

    if (!numero) {
      throw new Error("Não foi possível gerar o número do orçamento");
    }

    for (const e of est ?? []) {
      const reservado = pedidoPorCor.get(e.codigo) ?? (codigosComCor.has(e.codigo) ? 0 : pedidoPorCodigo.get(e.codigo) ?? 0);
      if (!reservado) continue;
      const nova = Math.max(
        0,
        e.quantidade - reservado,
      );

      await supabaseAdmin
        .from("estoque")
        .update({
          quantidade: nova,
          updated_at: new Date().toISOString(),
        })
        .eq("codigo", e.codigo);
    }

    const html = `
      <h2>Novo pedido ${numero}</h2>

      <p>
        <b>Cliente:</b> ${esc(cliente.nome)}<br>
        <b>E-mail:</b> ${esc(cliente.email)}<br>
        <b>Telefone:</b> ${esc(cliente.telefone)}<br>
        <b>Endereço:</b> ${esc(cliente.endereco)}
      </p>

      <table
        border="1"
        cellpadding="6"
        style="border-collapse: collapse"
      >
        <tr>
          <th>Produto</th>
          <th>Cor</th>
          <th>Tamanho</th>
          <th>Qtd</th>
          <th>Unit.</th>
          <th>Total</th>
        </tr>

        ${linhas
          .map(
            (l) => `
              <tr>
                <td>${esc(l.nome)} ${esc(l.codigo)}</td>
                <td>${esc(l.cor)}</td>
                <td>${l.tam ? esc(l.tam) : "Não se aplica"}</td>
                <td>${l.qtd}</td>
                <td>${brl(l.unit)}</td>
                <td>${brl(l.total)}</td>
              </tr>
            `,
          )
          .join("")}
      </table>

      <p>
        Subtotal: ${brl(subtotal)}<br>
        Frete: ${frete === null ? "A calcular" : brl(frete)}
        — ${esc(freteServico ?? "")}<br>
        <b>Total: ${brl(total)}</b>
      </p>
    `;

    const enviado = await enviarEmailLoja(
      `Novo pedido ${numero} - ${cliente.nome}`,
      html,
    );

    if (enviado) {
      await supabaseAdmin
        .from("orders")
        .update({ email_enviado: true })
        .eq("numero", numero);
    }

    return { numero, emailEnviado: enviado };
  });

export const enviarContato = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        nome: z.string().trim().min(2).max(100),
        email: z.string().trim().email().max(255),
        telefone: z.string().trim().max(30),
        assunto: z.enum([
          "Dúvida",
          "Orçamento",
          "Troca e devolução",
          "Pedido",
          "Outro",
        ]),
        mensagem: z.string().trim().min(5).max(2000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { error } = await supabaseAdmin
      .from("contact_messages")
      .insert(data);

    if (error) {
      throw new Error("Não foi possível enviar sua mensagem");
    }

    const emailEnviado = await enviarEmailLoja(
      `Fale Conosco: ${data.assunto} - ${data.nome}`,
      `
        <h2>${esc(data.assunto)}</h2>
        <p>
          <b>${esc(data.nome)}</b><br>
          ${esc(data.email)}<br>
          ${esc(data.telefone)}
        </p>
        <p>${esc(data.mensagem).replace(/\n/g, "<br>")}</p>
      `,
      data.email,
    );

    return { ok: true, emailEnviado };
  });
