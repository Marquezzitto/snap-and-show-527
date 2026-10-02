import { registerSW } from "virtual:pwa-register";

export async function registerStoreWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const host = location.hostname;
  const blocked = !import.meta.env.PROD || window !== window.top || host.startsWith("id-preview--") || host.startsWith("preview--") ||
    ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some((suffix) => host === suffix || host.endsWith(`.${suffix}`)) ||
    new URLSearchParams(location.search).get("sw") === "off";
  if (blocked) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.filter((reg) => new URL(reg.active?.scriptURL ?? reg.installing?.scriptURL ?? reg.waiting?.scriptURL ?? "/", location.origin).pathname === "/sw.js")
      .map((reg) => reg.unregister()));
    return;
  }
  registerSW({ immediate: true });
}
