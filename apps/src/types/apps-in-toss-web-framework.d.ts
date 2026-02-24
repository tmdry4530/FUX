// TEMP: 문서 확인 완료 (2026-02-24)
// 출처: Apps in Toss 개발자센터 - IAA 2.0 ver2, 공유 API
// 실제 런타임은 @apps-in-toss/web-framework가 제공하며, 이 스텁은 빌드 전용입니다.

declare module "@apps-in-toss/web-framework" {
  // --- IAA 2.0 ver2 광고 ---

  interface LoadFullScreenAdEvent {
    type: "loaded";
  }

  interface ShowFullScreenAdEvent {
    type:
      | "requested"
      | "show"
      | "impression"
      | "clicked"
      | "dismissed"
      | "failedToShow"
      | "userEarnedReward";
    data?: { unitType: string; unitAmount: number };
  }

  interface LoadAdOptions {
    options: { adGroupId: string };
    onEvent: (event: LoadFullScreenAdEvent) => void;
    onError: (error: unknown) => void;
  }

  interface ShowAdOptions {
    options: { adGroupId: string };
    onEvent: (event: ShowFullScreenAdEvent) => void;
    onError: (error: unknown) => void;
  }

  interface LoadFullScreenAd {
    (options: LoadAdOptions): () => void;
    isSupported(): boolean;
  }

  interface ShowFullScreenAd {
    (options: ShowAdOptions): () => void;
    isSupported(): boolean;
  }

  export const loadFullScreenAd: LoadFullScreenAd;
  export const showFullScreenAd: ShowFullScreenAd;

  // --- 공유 ---

  export function share(options: { message: string }): Promise<void>;
  export function getTossShareLink(
    url: string,
    ogImageUrl?: string
  ): Promise<string>;
}
