CREATE TABLE public.product_overrides (
  product_id text PRIMARY KEY,
  nome text,
  descricao text,
  preco_vista numeric(10,2) CHECK (preco_vista >= 0),
  visivel boolean NOT NULL DEFAULT true,
  fotos_adicionais jsonb NOT NULL DEFAULT '[]'::jsonb,
  fotos_ocultas jsonb NOT NULL DEFAULT '[]'::jsonb,
  fotos_cores jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_overrides_id_limit CHECK (length(product_id) BETWEEN 1 AND 80),
  CONSTRAINT product_overrides_name_limit CHECK (nome IS NULL OR length(nome) BETWEEN 1 AND 200),
  CONSTRAINT product_overrides_desc_limit CHECK (descricao IS NULL OR length(descricao) <= 2000),
  CONSTRAINT product_overrides_photos_array CHECK (jsonb_typeof(fotos_adicionais) = 'array' AND jsonb_typeof(fotos_ocultas) = 'array' AND jsonb_typeof(fotos_cores) = 'object')
);
GRANT SELECT ON public.product_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_overrides TO authenticated;
GRANT ALL ON public.product_overrides TO service_role;
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible product overrides" ON public.product_overrides FOR SELECT TO anon, authenticated USING (visivel = true OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins add product overrides" ON public.product_overrides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins edit product overrides" ON public.product_overrides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete product overrides" ON public.product_overrides FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE OR REPLACE FUNCTION public.touch_product_overrides_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER touch_product_overrides BEFORE UPDATE ON public.product_overrides FOR EACH ROW EXECUTE FUNCTION public.touch_product_overrides_updated_at();
CREATE POLICY "Anyone can view catalog photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'catalog-photos');
CREATE POLICY "Admins can add catalog photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can edit catalog photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can remove catalog photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'catalog-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));