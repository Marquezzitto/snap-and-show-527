import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

const KEY = "marks-favorites-v1";
function read(key: string): string[] { try { const value = JSON.parse(localStorage.getItem(key) ?? "[]"); return Array.isArray(value) ? value.filter((v) => typeof v === "string").slice(0, 200) : []; } catch { return []; } }
const Context = createContext<{ favorites: string[]; toggle: (id: string) => void }>({ favorites: [], toggle: () => {} });
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const key = user ? `${KEY}-${user.id}` : KEY;
  useEffect(() => { setFavorites(read(key)); }, [key]);
  function toggle(id: string) { setFavorites((old) => { const next = old.includes(id) ? old.filter((v) => v !== id) : [...old, id]; localStorage.setItem(key, JSON.stringify(next)); return next; }); }
  return <Context.Provider value={{ favorites, toggle }}>{children}</Context.Provider>;
}
export const useFavorites = () => useContext(Context);
