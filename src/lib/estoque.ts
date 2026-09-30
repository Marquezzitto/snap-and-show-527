import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/** Mapa código → quantidade. Produto sem registro = estoque não controlado (disponível). */
export function useEstoque() {
  const [estoque, setEstoque] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const recarregar = useCallback(async () => {
    const { data } = await supabase.from("estoque").select("codigo, quantidade");
    setEstoque(Object.fromEntries((data ?? []).map((r) => [r.codigo, r.quantidade])));
    setLoading(false);
  }, []);
  useEffect(() => {
    recarregar();
  }, [recarregar]);
  return { estoque, loading, recarregar };
}

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      setChecking(false);
    });
  }, [user, loading]);
  return { isAdmin, checking: loading || checking };
}
