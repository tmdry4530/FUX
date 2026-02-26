import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        // 토스 WebView 외부에서는 항상 mock 사용 (dev + build 모두)
        "@apps-in-toss/web-framework": path.resolve(
          __dirname,
          "src/mocks/apps-in-toss-web-framework.ts",
        ),
      },
    },
    server: {
      port: 3000,
    },
  };
});
