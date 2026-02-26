import { Storage, getUserKeyForGame, grantPromotionRewardForGame, loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// Storage 래퍼
export async function save(key: string, value: string): Promise<void> {
  try {
    await (Storage as any).setItem(key, value);
  } catch {
    localStorage.setItem(key, value);
  }
}

export async function load(key: string): Promise<string | null> {
  try {
    return await (Storage as any).getItem(key);
  } catch {
    return localStorage.getItem(key);
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await (Storage as any).removeItem(key);
  } catch {
    localStorage.removeItem(key);
  }
}

// Auth
export async function getUserHash(): Promise<string> {
  try {
    const result = await (getUserKeyForGame as any)();
    return result?.hash ?? 'anonymous';
  } catch {
    return 'local-dev-user';
  }
}

// Toss Point
export interface GrantResult {
  success: boolean;
  key?: string;
}

export async function grantTossPoint(code: string, amount: number): Promise<GrantResult> {
  try {
    const result = await (grantPromotionRewardForGame as any)({
      params: { promotionCode: code, amount }
    });
    return { success: true, key: result?.key };
  } catch (e) {
    console.warn('[TossAdapter] grantTossPoint failed:', e);
    return { success: false };
  }
}

// Rewarded Ad
export async function showRewardedAd(adGroupId: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      let earned = false;
      (loadFullScreenAd as any)({
        options: { adGroupId },
        onEvent: (event: { type: string }) => {
          if (event.type === 'userEarnedReward') earned = true;
          if (event.type === 'dismissed' || event.type === 'closed') resolve(earned);
        },
        onError: () => resolve(false),
      });
      (showFullScreenAd as any)({
        options: { adGroupId },
        onEvent: () => {},
        onError: () => resolve(false),
      });
    } catch {
      resolve(false);
    }
  });
}
