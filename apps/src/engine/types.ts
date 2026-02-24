import type { StageSpec } from "../stages/stage-spec";

export type StagePhase = "READY" | "PLAYING" | "RESULT";

export interface StageResult {
  stageId: string;
  cleared: boolean;
  elapsedMs: number;
  timeLimitMs: number;
  missCount: number;
}

export interface StageRunnerState {
  phase: StagePhase;
  remainingMs: number;
  missCount: number;
  start: () => void;
  succeed: () => void;
  miss: () => void;
  reset: () => void;
  result: StageResult | null;
}

export interface StageRendererProps {
  spec: StageSpec;
  phase: StagePhase;
  remainingMs: number;
  onSuccess: () => void;
  onMiss: () => void;
}
