import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const tamanhoOpcional = z.preprocess(
  (valor) => (typeof valor === "string" ? valor : ""),
  z.string().max(120),
);

const itemSchema = z.object({
  id: z.string().max(60),
  cor: z.string().max(80).optional().default(""),
  tam: tamanhoOpcional,
  qtd: z.number().int().min(1).max(50),
});

const itensSchema = z.array(itemSchema).max(100);

export const carregarCarrinho = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // A tabela foi adicionada por migração e os tipos serão atualizados
    // automaticamente pelo Lovable Cloud.
    const database = context.supabase as any;

    const { data, error } = await database
      .from("shopping_carts")
      .select("itens")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) {
      throw new Error("Não foi possível carregar o carrinho");
    }

    return {
      itens: itensSchema.parse(data?.itens ?? []),
    };
  });

export const salvarCarrinho = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        itens: itensSchema,
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const database = context.supabase as any;

    const { error } = await database
      .from("shopping_carts")
      .upsert(
        {
          user_id: context.userId,
          itens: data.itens,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

    if (error) {
      throw new Error("Não foi possível salvar o carrinho");
    }

    return { ok: true };
  });
