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
        // 로컬 dev/preview: mock으로 대체, 프로덕션 빌드: external 유지
        ...(!isBuild
          ? {
              "@apps-in-toss/web-framework": path.resolve(
                __dirname,
                "src/mocks/apps-in-toss-web-framework.ts",
              ),
            }
          : {}),
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
  };
});
