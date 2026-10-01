CREATE TABLE public.shopping_carts (
  user_id UUID PRIMARY KEY,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.shopping_carts
TO authenticated;

GRANT ALL
ON public.shopping_carts
TO service_role;

ALTER TABLE public.shopping_carts
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente pode visualizar o próprio carrinho"
ON public.shopping_carts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Cliente pode criar o próprio carrinho"
ON public.shopping_carts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cliente pode atualizar o próprio carrinho"
ON public.shopping_carts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cliente pode excluir o próprio carrinho"
ON public.shopping_carts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
