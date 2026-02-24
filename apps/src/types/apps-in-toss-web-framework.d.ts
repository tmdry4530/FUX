declare module "@apps-in-toss/web-framework" {
  interface AdEvent {
    type: "loaded" | "userEarnedReward" | "dismissed" | "failedToShow";
  }

  interface AdOptions {
    options: { adGroupId: string };
    onEvent: (event: AdEvent) => void;
    onError: (error: unknown) => void;
  }

  interface LoadFullScreenAd {
    (options: AdOptions): () => void;
    isSupported(): boolean;
  }

  export const loadFullScreenAd: LoadFullScreenAd;
  export function showFullScreenAd(options: AdOptions): () => void;

  export function share(options: { message: string }): Promise<void>;
  export function getTossShareLink(
    url: string,
    ogImageUrl?: string
  ): Promise<string>;
}
