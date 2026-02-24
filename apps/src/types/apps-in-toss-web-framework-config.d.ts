// TEMP: 문서 확인 완료 (2026-02-24)
// 출처: Apps in Toss 개발자센터 - Granite WebView 설정
// 실제 런타임은 @apps-in-toss/web-framework/config가 제공하며, 이 스텁은 빌드 전용입니다.

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
    outdir?: string;
    webViewProps?: {
      type?: "game" | "partner" | "external";
    };
    permissions?: string[];
  }

  export function defineConfig(config: GraniteConfig): GraniteConfig;
}
