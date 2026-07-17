import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 3010,
    strictPort: true,
    proxy: {
      // Local DX: FE /api/* → Hono on :8787/*
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "") || "/",
      },
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 3010,
    strictPort: true,
  },
});
