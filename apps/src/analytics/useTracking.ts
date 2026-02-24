import { useCallback } from "react";
import type { AnalyticsEvent } from "./events";

const isDev = import.meta.env.DEV;

/**
 * 이벤트 트래킹 훅
 * - 개발 환경: console 로깅
 * - 프로덕션: 추후 실제 분석 서비스 연동 확장 포인트
 */
export function useTracking() {
  const trackEvent = useCallback((event: Omit<AnalyticsEvent, "timestamp">) => {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    } as AnalyticsEvent;

    if (isDev) {
      console.log("[FuckUX:Track]", fullEvent.type, fullEvent);
    }

    // TODO: 프로덕션 분석 서비스 연동
    // e.g. sendToAnalytics(fullEvent);
  }, []);

  return { trackEvent };
}
