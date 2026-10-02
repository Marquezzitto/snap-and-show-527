import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useCatalog } from "@/lib/catalog";
import { CatalogImage } from "@/components/site/CatalogImage";
import { getProductPhotos } from "@/data/productPhotos";

export const Route = createFileRoute("/categorias")({
  head: () => ({ meta: [
    { title: "Categorias — Marks Imports" }, { name: "description", content: "Explore as categorias de produtos Marks Imports." },
    { property: "og:title", content: "Categorias — Marks Imports" }, { property: "og:description", content: "Explore as categorias de produtos Marks Imports." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Categories,
});
function Categories() {
  const { products, overrides } = useCatalog();
  const cats = Array.from(new Set(products.map((p) => p.categoria)));
  return <div className="min-h-screen bg-background text-foreground"><SiteHeader /><main className="mx-auto max-w-6xl px-4 py-8 pb-24"><h1 className="mb-7 text-3xl font-bold">Categorias</h1><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{cats.map((cat) => {
    const items = products.filter((p) => p.categoria === cat);
    const image = getProductPhotos(items[0], overrides[items[0].id]).gallery[0];
    return <Link key={cat} to="/" hash={cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")} className="overflow-hidden rounded-md border border-border bg-card"><div className="aspect-square bg-secondary">{image && <CatalogImage src={image} alt="" className="h-full w-full object-contain p-3" />}</div><div className="p-3"><h2 className="font-semibold">{cat}</h2><p className="text-xs text-muted-foreground">{items.length} produtos</p></div></Link>;
  })}</div></main><SiteFooter /></div>;
}
