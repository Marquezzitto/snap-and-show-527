import drivePhotos from "./drivePhotos.json";
import { watchPhotos } from "./watchPhotos";
import type { Produto } from "./products";

const photos = drivePhotos as Record<string, { photos: string[]; colors: Record<string, string> }>;

export function getProductPhotos(product: Produto) {
  const code = product.codigo ?? "";
  const source = photos[code];
  const gallery = [...new Set([...(source?.photos ?? []), ...(watchPhotos[code] ?? []), ...(product.imagem ? [product.imagem] : [])])];
  return { gallery, colors: source?.colors ?? {} };
}