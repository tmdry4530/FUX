/**
 * Analytics Logger Adapter
 *
 * - Toss 환경: @apps-in-toss/web-framework의 Analytics API 사용
 * - 로컬 preview: console.log로 동일 payload 출력
 *
 * Apps in Toss Analytics API (문서 확인 완료):
 *   Analytics.click({ log_name, ...params })
 *   Analytics.screen({ log_name, ...params })
 *   Analytics.impression({ log_name, ...params })
 */

type AnalyticsParams = Record<string, string | number | boolean>;

interface AnalyticsAPI {
  click(params: { log_name: string } & AnalyticsParams): void;
  screen(params: { log_name: string } & AnalyticsParams): void;
  impression(params: { log_name: string } & AnalyticsParams): void;
}

let _analytics: AnalyticsAPI | null = null;
// Toss 런타임에서 Analytics를 비동기로 해석
// 외부화된 모듈이므로 dynamic import로 graceful fallback
import("@apps-in-toss/web-framework")
  .then((mod) => {
    const a = (mod as unknown as { Analytics?: AnalyticsAPI }).Analytics;
    if (a && typeof a.click === "function") {
      _analytics = a;
    }
  })
  .catch(() => {
    // Not in Toss environment - console fallback active
  });

function logToConsole(method: string, params: Record<string, unknown>) {
  console.log(`[FUX:Analytics:${method}]`, params);
}

// --- Public API ---

export function trackClick(logName: string, params: AnalyticsParams = {}) {
  const payload = { log_name: logName, ...params };
  if (_analytics) {
    _analytics.click(payload);
  } else {
    logToConsole("click", payload);
  }
}

export function trackScreen(logName: string, params: AnalyticsParams = {}) {
  const payload = { log_name: logName, ...params };
  if (_analytics) {
    _analytics.screen(payload);
  } else {
    logToConsole("screen", payload);
  }
}

export function trackImpression(logName: string, params: AnalyticsParams = {}) {
  const payload = { log_name: logName, ...params };
  if (_analytics) {
    _analytics.impression(payload);
  } else {
    logToConsole("impression", payload);
  }
}

// --- Convenience wrappers ---

export function trackStageStart(stageId: string, stageType: string, difficulty: number) {
  trackClick("stage_start", { stage_id: stageId, stage_type: stageType, difficulty });
}

export function trackStageEnd(
  stageId: string,
  stageType: string,
  difficulty: number,
  success: boolean,
  durationMs: number,
) {
  trackClick("stage_end", {
    stage_id: stageId,
    stage_type: stageType,
    difficulty,
    success,
    duration_ms: durationMs,
  });
}

export function trackAdEvent(
  eventType: string,
  adGroupId: string,
  rewarded: boolean,
  rewardGranted?: boolean,
) {
  trackImpression("ad_event", {
    event_type: eventType,
    ad_group_id: adGroupId,
    rewarded,
    ...(rewardGranted !== undefined ? { reward_granted: rewardGranted } : {}),
  });
}

export function trackShareClick(stageId: string, success: boolean) {
  trackClick("share_click", { stage_id: stageId, success });
}
