import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Default to the hosted API. Override with VITE_PROXY_TARGET for a local
// backend (e.g. VITE_PROXY_TARGET=http://localhost:5041 npm run dev).
const proxyTarget =
  globalThis.process?.env?.VITE_PROXY_TARGET ??
  "https://manaraljarkas.visual-host.com";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
