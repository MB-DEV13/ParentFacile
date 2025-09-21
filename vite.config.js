import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    port: 5174, // si tu l’utilises
    proxy: {
      "/api": {
        target: "http://localhost:4000", // <-- backend Express
        changeOrigin: true,
        // pas de rewrite: on garde /api tel quel
      },
      "/pdfs": {
        target: "http://localhost:4000", // si ces fichiers viennent aussi du backend
        changeOrigin: true,
      },
    },
  },
});
