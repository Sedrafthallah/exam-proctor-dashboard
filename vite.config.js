import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Explicitly load .env / .env.[mode] files — vite.config.js itself runs
  // in Node and does NOT get these merged into process.env automatically;
  // only client code (import.meta.env) gets that for free.
  const env = loadEnv(mode, globalThis.process.cwd(), "");

  // Default to local API for Stream-layer smoke (hub + ICE). Override with
  // VITE_PROXY_TARGET if you need the hosted backend instead.
  const proxyTarget = env.VITE_PROXY_TARGET ?? "http://localhost:5041";

  return {
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
  };
});
