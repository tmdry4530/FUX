import { useCallback } from "react";
import { getTossShareLink, share } from "@apps-in-toss/web-framework";

const DEEP_LINK_PREFIX = "intoss://fuck-ux/stage";

interface UseShareReturn {
  shareStage: (
    stageId: string,
    memeCaption: string,
    ogImageUrl?: string
  ) => Promise<boolean>;
}

/**
 * OG 이미지 URL 구성.
 * getTossShareLink에 전달하는 ogImageUrl은 https:// 절대 경로여야 합니다.
 * 배포 도메인이 없는 로컬 환경에서는 undefined로 fallback합니다.
 */
function buildOgImageUrl(): string | undefined {
  try {
    const url = new URL("/og.png", window.location.origin).toString();
    // getTossShareLink는 https:// 만 허용
    if (url.startsWith("https://")) return url;
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * 스테이지 공유 훅
 * - 딥링크: intoss://fuck-ux/stage/{stageId}
 * - getTossShareLink(url, ogImageUrl?)로 공유 링크 생성
 * - share({ message })로 네이티브 공유 시트 호출
 */
export function useShare(): UseShareReturn {
  const shareStage = useCallback(
    async (
      stageId: string,
      memeCaption: string,
      ogImageUrl?: string
    ): Promise<boolean> => {
      try {
        const deepLink = `${DEEP_LINK_PREFIX}/${stageId}`;
        const resolvedOg = ogImageUrl ?? buildOgImageUrl();
        const shareLink = await getTossShareLink(deepLink, resolvedOg);
        await share({ message: `${memeCaption}\n${shareLink}` });
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  return { shareStage };
}
