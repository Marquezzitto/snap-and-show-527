import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProductPhotos } from "@/data/productPhotos";
import { useCatalog } from "@/lib/catalog";
import type { HomepageSlide } from "./homepage-carousel-model";

export const BANNER_BUCKET = "homepage-banners";

export function useHomepageCarousel() {
  const queryClient = useQueryClient();
  const { products, overrides } = useCatalog();
  const query = useQuery({
    queryKey: ["homepage-carousel"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_carousel").select("slides").eq("id", "main").maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return (Array.isArray(data.slides) ? data.slides : []).filter((slide): slide is unknown & HomepageSlide =>
        typeof slide === "object" && slide !== null && "id" in slide && typeof slide.id === "string" &&
        "productId" in slide && typeof slide.productId === "string" && "imagePath" in slide && typeof slide.imagePath === "string"
      ) as HomepageSlide[];
    },
  });
  const defaults: HomepageSlide[] = products.filter((p) => getProductPhotos(p, overrides[p.id]).gallery.length > 0).slice(0, 3)
    .map((p) => ({ id: `default-${p.id}`, productId: p.id, imagePath: "" }));
  const slides = query.data === null ? defaults : query.data ?? [];
  async function save(next: HomepageSlide[]) {
    const { error } = await supabase.from("homepage_carousel").upsert({ id: "main", slides: next.map((s) => ({ ...s })), updated_at: new Date().toISOString() });
    if (error) throw error;
    queryClient.setQueryData(["homepage-carousel"], next);
  }
  return { slides, products, overrides, save, loading: query.isPending, error: query.isError, retry: query.refetch };
}

export async function resolveBanner(path: string) {
  const { data, error } = await supabase.storage.from(BANNER_BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}