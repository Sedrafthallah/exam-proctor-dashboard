import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
        target: "https://manaraljarkas.visual-host.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
