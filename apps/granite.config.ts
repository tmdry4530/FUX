import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "ilbureo",
  brand: {
    displayName: "일부러 불편한 앱 - 하루 1분 나쁜 디자인 탈출",
    primaryColor: "#3182F6",
    icon: "/logo-light.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite",
      build: "tsc -b && vite build",
    },
  },
  webViewProps: {
    type: "game",
  },
  permissions: [],
});
