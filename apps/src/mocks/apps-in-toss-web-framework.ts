/**
 * @apps-in-toss/web-framework 로컬 개발용 mock
 *
 * Toss WebView 외부(로컬 preview/dev)에서 앱이 정상 렌더링되도록
 * 모든 플랫폼 API를 no-op 또는 console.log로 대체합니다.
 * 프로덕션 빌드에서는 사용되지 않습니다 (external로 처리).
 */

// --- IAA 2.0 ver2 광고 mock ---

export const loadFullScreenAd = Object.assign(
  (options: { options: { adGroupId: string }; onEvent: (e: { type: string }) => void; onError: (e: unknown) => void }) => {
    console.log("[Mock:loadFullScreenAd]", options.options.adGroupId);
    return () => {};
  },
  { isSupported: () => false },
);

export const showFullScreenAd = Object.assign(
  (options: { options: { adGroupId: string }; onEvent: (e: { type: string }) => void; onError: (e: unknown) => void }) => {
    console.log("[Mock:showFullScreenAd]", options.options.adGroupId);
    return () => {};
  },
  { isSupported: () => false },
);

// --- 공유 mock ---

export async function share(options: { message: string }): Promise<void> {
  console.log("[Mock:share]", options.message);
  // 웹 Share API fallback 시도
  if (navigator.share) {
    await navigator.share({ text: options.message });
  } else {
    alert(`공유 내용:\n${options.message}`);
  }
}

export async function getTossShareLink(url: string, ogImageUrl?: string): Promise<string> {
  console.log("[Mock:getTossShareLink]", { url, ogImageUrl });
  return url;
}

// --- Analytics mock ---

export const Analytics = {
  click(params: Record<string, unknown>) {
    console.log("[Mock:Analytics.click]", params);
  },
  screen(params: Record<string, unknown>) {
    console.log("[Mock:Analytics.screen]", params);
  },
  impression(params: Record<string, unknown>) {
    console.log("[Mock:Analytics.impression]", params);
  },
};
