import drivePhotos from "./drivePhotos.json";
import { watchPhotos } from "./watchPhotos";
import type { Produto } from "./products";
import type { ProductOverride } from "@/lib/catalog";

const photos = drivePhotos as Record<string, { photos: string[]; colors: Record<string, string> }>;

export function getProductPhotos(product: Produto, override?: ProductOverride) {
  const code = product.codigo ?? "";
  const source = photos[code];
  const gallery = [...new Set([...(override?.fotos_adicionais ?? []), ...(source?.photos ?? []), ...(watchPhotos[code] ?? []), ...(product.imagem ? [product.imagem] : [])])].filter((photo) => !override?.fotos_ocultas.includes(photo));
  const colors = { ...(source?.colors ?? {}), ...(override?.fotos_cores ?? {}) };
  return { gallery, colors };
}