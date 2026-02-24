import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        "@apps-in-toss/web-framework",
        "@apps-in-toss/web-framework/config",
        "@toss/tds-mobile",
      ],
    },
  },
  server: {
    port: 3000,
  },
});
