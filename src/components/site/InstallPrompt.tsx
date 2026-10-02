import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(localStorage.getItem("marks-install-dismissed") === "yes" || !import.meta.env.PROD);
    const handler = (e: Event) => { e.preventDefault(); setEvent(e as InstallEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (dismissed || !event) return null;
  return <div role="dialog" aria-label="Instalar Marks Imports" className="fixed inset-x-4 bottom-20 z-40 rounded-xl border border-border bg-card p-4 shadow-xl md:inset-x-auto md:bottom-6 md:right-6 md:max-w-sm"><p className="font-semibold">Instale a Marks Imports</p><p className="mt-1 text-sm text-muted-foreground">Tenha nossa loja na tela inicial do seu celular.</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => { void event.prompt().then(() => event.userChoice).then(() => setEvent(null)); }}>Instalar</Button><Button size="sm" variant="ghost" onClick={() => { localStorage.setItem("marks-install-dismissed", "yes"); setDismissed(true); }}>Agora não</Button></div></div>;
}
