import { useCallback } from "react";
import type { AnalyticsEvent } from "./events";
import { trackClick } from "./logger";

/**
 * 이벤트 트래킹 훅
 * - logger.ts 어댑터를 통해 Toss Analytics API 또는 console.log로 전송
 */
export function useTracking() {
  const trackEvent = useCallback((event: Omit<AnalyticsEvent, "timestamp">) => {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    } as AnalyticsEvent;

    // logger.ts 어댑터로 전송 (Toss 환경: Analytics API, 로컬: console.log)
    trackClick(fullEvent.type, fullEvent as unknown as Record<string, string | number | boolean>);
  }, []);

  return { trackEvent };
}
