import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { isSitemapRouteIncluded, sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";
import { collectPublicOverrides, visibleProductIds } from "@/lib/sitemap-catalog";

const BASE_URL = "https://marksimports.com.br";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        try {
          const router = await getRouterInstance();
          const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
          const productRouteId = "/produto/$productId";
          if (isSitemapRouteIncluded(router.routesById[productRouteId])) {
            const { createClient } = await import("@supabase/supabase-js");
            const { produtos } = await import("@/data/products");
            const url = process.env["SUPABASE_URL"];
            const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
            if (!url || !key) throw new Error("Public catalog configuration unavailable");
            const client = createClient<import("@/integrations/supabase/types").Database>(url, key, {
              auth: { persistSession: false, autoRefreshToken: false },
              global: { fetch: (input, init) => {
                const headers = new Headers(init?.headers);
                if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
                headers.set("apikey", key);
                return fetch(input, { ...init, headers });
              } },
            });
            const overrides = await collectPublicOverrides(async (offset, size) => {
              const { data, error } = await client.rpc("hidden_product_ids").range(offset, offset + size - 1);
              if (error) throw error;
              return ((data ?? []) as string[]).map((product_id) => ({ product_id, visivel: false }));
            });
            for (const productId of visibleProductIds(produtos, overrides)) {
              const location = router.buildLocation({ to: "/produto/$productId", params: { productId }, search: () => ({}), hash: "" });
              const path = sitemapPathForLocation(router, location, productRouteId);
              if (path) entries.push({ path });
            }
          }
          if (!entries.length) return new Response("No discoverable pages", { status: 404 });
          return new Response(sitemapXML(BASE_URL, entries), { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
        } catch {
          return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
        }
      },
    },
  },
});