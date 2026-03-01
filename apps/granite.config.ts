import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "ux-trap",
  brand: {
    displayName: "UX Trap - 속이는 설계 체험 게임",
    primaryColor: "#3182F6",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite",
      build: "vite build",
    },
  },
  webViewProps: {
    type: "game",
  },
  permissions: [],
});
