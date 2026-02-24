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
        const shareLink = await getTossShareLink(deepLink, ogImageUrl);
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
