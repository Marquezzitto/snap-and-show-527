-- Stock: table reads admin-only; storefront reads through a narrow function
DROP POLICY IF EXISTS "estoque public read" ON public.estoque;
CREATE POLICY "estoque admin read" ON public.estoque FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE OR REPLACE FUNCTION public.public_stock()
RETURNS TABLE (codigo text, quantidade integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT e.codigo, e.quantidade FROM public.estoque e $$;
REVOKE ALL ON FUNCTION public.public_stock() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_stock() TO anon, authenticated, service_role;

-- Product overrides: public sees only visible products; admins see all
DROP POLICY IF EXISTS "Public reads catalog display settings" ON public.product_overrides;
CREATE POLICY "Public reads visible product settings" ON public.product_overrides FOR SELECT TO anon, authenticated USING (visivel = true);
CREATE POLICY "Admins read all product settings" ON public.product_overrides FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE OR REPLACE FUNCTION public.hidden_product_ids()
RETURNS SETOF text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT product_id FROM public.product_overrides WHERE visivel = false $$;
REVOKE ALL ON FUNCTION public.hidden_product_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hidden_product_ids() TO anon, authenticated, service_role;

-- Storage: public may read only files currently referenced by published content
DROP POLICY IF EXISTS "Visitors view homepage banner files" ON storage.objects;
CREATE POLICY "Visitors view published homepage banners" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'homepage-banners' AND EXISTS (
  SELECT 1 FROM public.homepage_carousel c, jsonb_array_elements(c.slides) s WHERE s->>'imagePath' = storage.objects.name));

DROP POLICY IF EXISTS "Anyone can view catalog photos" ON storage.objects;
CREATE POLICY "Visitors view published catalog photos" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'catalog-photos' AND EXISTS (
  SELECT 1 FROM public.product_overrides o WHERE o.visivel = true AND o.fotos_adicionais ? ('catalog-photos/' || storage.objects.name)));
CREATE POLICY "Admins read catalog photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'::app_role));