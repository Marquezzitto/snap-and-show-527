// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,woff2,png,svg}"],
        navigateFallback: undefined,
        runtimeCaching: [{
          urlPattern: ({ request, url }) => request.mode === "navigate" && url.origin === self.location.origin && !url.pathname.startsWith("/~oauth") && !url.pathname.startsWith("/api/") && !url.pathname.startsWith("/auth") && !url.pathname.startsWith("/checkout") && !url.pathname.startsWith("/pedido"),
          handler: "NetworkFirst",
          options: { cacheName: "marks-pages", networkTimeoutSeconds: 5, expiration: { maxEntries: 8, maxAgeSeconds: 3600 } },
        }, {
          urlPattern: ({ url }) => url.origin === self.location.origin && /\/assets\/[^/]+-[a-zA-Z0-9]{8,}\.(js|css)$/.test(url.pathname),
          handler: "CacheFirst",
          options: { cacheName: "marks-assets", expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 } },
        }],
      },
    })],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
