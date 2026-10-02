import { useEffect, useState } from "react";
import { resolveCatalogPhoto } from "@/lib/catalog";

export function CatalogImage({ src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [url, setUrl] = useState<string | null>(src?.startsWith("catalog-photos/") ? null : src ?? null);
  useEffect(() => {
    if (!src?.startsWith("catalog-photos/")) { setUrl(src ?? null); return; }
    let active = true;
    void resolveCatalogPhoto(src.slice("catalog-photos/".length)).then((result) => { if (active) setUrl(result); });
    return () => { active = false; };
  }, [src]);
  return url ? <img {...props} src={url} /> : <span role="img" aria-label={props.alt ?? "Foto carregando"} className="block bg-secondary" />;
}
