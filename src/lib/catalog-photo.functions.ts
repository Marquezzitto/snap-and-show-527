import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Signs a product photo only when it belongs to a visible product, so visitors never read the storage bucket directly.
export const signCatalogPhoto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ path: z.string().min(1).max(300).regex(/^[\w-]+\/[\w-]+\.(jpg|png|webp)$/) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ref = `catalog-photos/${data.path}`;
    const { data: rows, error } = await supabaseAdmin.from("product_overrides").select("product_id").eq("visivel", true).contains("fotos_adicionais", [ref]).limit(1);
    if (error || !rows?.length) return { url: null as string | null };
    const signed = await supabaseAdmin.storage.from("catalog-photos").createSignedUrl(data.path, 3600);
    return { url: signed.error ? null : signed.data.signedUrl };
  });
