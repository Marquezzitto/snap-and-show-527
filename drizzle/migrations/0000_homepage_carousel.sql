CREATE TABLE public.homepage_carousel (
 id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
 slides jsonb NOT NULL DEFAULT '[]'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.homepage_carousel TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.homepage_carousel TO authenticated;
GRANT ALL ON public.homepage_carousel TO service_role;
ALTER TABLE public.homepage_carousel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads homepage carousel" ON public.homepage_carousel FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin inserts homepage carousel" ON public.homepage_carousel FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates homepage carousel" ON public.homepage_carousel FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes homepage carousel" ON public.homepage_carousel FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin uploads homepage banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'homepage-banners' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin reads homepage banner files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'homepage-banners' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates homepage banner files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'homepage-banners' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'homepage-banners' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes homepage banner files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'homepage-banners' AND public.has_role(auth.uid(), 'admin'));