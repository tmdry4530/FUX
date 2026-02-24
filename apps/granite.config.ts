import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "fuck-ux",
  brand: {
    displayName: "FUX - Bad UX Simulator",
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
