import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Default to local API for Stream-layer smoke (hub + ICE). Override with
// VITE_PROXY_TARGET if you need the hosted backend instead.
const proxyTarget =
  globalThis.process?.env?.VITE_PROXY_TARGET ?? "http://localhost:5041";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    pool: "threads",
  },
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
