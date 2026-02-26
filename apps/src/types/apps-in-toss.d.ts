declare module '@apps-in-toss/web-framework' {
  export const Storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    clearItems(): Promise<void>;
  };

  export function getUserKeyForGame(): Promise<{ hash: string }>;

  export function grantPromotionRewardForGame(params: {
    params: { promotionCode: string; amount: number };
  }): Promise<{ key: string }>;

  export function submitGameCenterLeaderBoardScore(params: {
    params: { score: number };
  }): Promise<void>;

  export function contactsViral(params: {
    params: { promotionCode: string };
  }): Promise<{ success: boolean }>;

  export const loadFullScreenAd: ((options: {
    options: { adGroupId: string };
    onEvent: (e: { type: string }) => void;
    onError: (e: unknown) => void;
  }) => void) & { isSupported: () => boolean };

  export const showFullScreenAd: ((options: {
    options: { adGroupId: string };
    onEvent: (e: { type: string }) => void;
    onError: (e: unknown) => void;
  }) => void) & { isSupported: () => boolean };

  export function share(options: { message: string }): Promise<void>;

  export function getTossShareLink(url: string, ogImageUrl?: string): Promise<string>;

  export const Analytics: {
    click(params: Record<string, unknown>): void;
    screen(params: Record<string, unknown>): void;
    impression(params: Record<string, unknown>): void;
  };
}
