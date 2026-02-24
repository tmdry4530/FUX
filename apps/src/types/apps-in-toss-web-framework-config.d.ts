declare module "@apps-in-toss/web-framework/config" {
  interface GraniteConfig {
    appName: string;
    brand?: {
      displayName?: string;
      primaryColor?: string;
      icon?: string;
    };
    web?: {
      host?: string;
      port?: number;
      commands?: {
        dev?: string;
        build?: string;
      };
    };
    webViewProps?: {
      type?: string;
    };
    permissions?: string[];
  }

  export function defineConfig(config: GraniteConfig): GraniteConfig;
}
