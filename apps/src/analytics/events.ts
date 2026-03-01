/**
 * 일부러 불편한 앱 이벤트 분석 스키마
 * 모든 유저 행동 이벤트의 타입 정의
 */

interface BaseEvent {
  /** 이벤트 발생 시각 (ISO 8601) */
  timestamp: string;
}

export interface StageStartEvent extends BaseEvent {
  type: "stage_start";
  stageId: string;
  stageType: string;
  difficulty: number;
}

export interface StageEndEvent extends BaseEvent {
  type: "stage_end";
  stageId: string;
  stageType: string;
  difficulty: number;
  /** 성공 여부 */
  success: boolean;
  /** 소요 시간 (ms) */
  durationMs: number;
}

export interface AdShowEvent extends BaseEvent {
  type: "ad_show";
  adGroupId: string;
  /** 보상형 광고 여부 */
  rewarded: boolean;
  /** 보상 지급 여부 (보상형일 때만 의미 있음) */
  rewardGranted: boolean;
}

export interface ShareClickEvent extends BaseEvent {
  type: "share_click";
  stageId: string;
  /** 공유 성공 여부 */
  success: boolean;
}

export interface StageSkipEvent extends BaseEvent {
  type: "stage_skip";
  stageId: string;
  stageType: string;
  /** 스킵 시점까지 경과 시간 (ms) */
  elapsedMs: number;
}

export interface HintUsedEvent extends BaseEvent {
  type: "hint_used";
  stageId: string;
  stageType: string;
  /** 힌트 사용 시점까지 경과 시간 (ms) */
  elapsedMs: number;
}

export type AnalyticsEvent =
  | StageStartEvent
  | StageEndEvent
  | AdShowEvent
  | ShareClickEvent
  | StageSkipEvent
  | HintUsedEvent;

export type EventType = AnalyticsEvent["type"];
