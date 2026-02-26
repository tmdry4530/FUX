import { useCallback, useEffect, useRef, useState } from "react";
import type { StageSpec } from "../stages/stage-spec";
import type { StagePhase, StageResult, StageRunnerState } from "./types";

const TICK_INTERVAL_MS = 50;
const GRACE_PERIOD_MS = 2000;

/** 난이도별 최대 오클릭 횟수 */
function getMaxMisses(difficulty: number): number {
  if (difficulty <= 1) return 10;
  if (difficulty === 2) return 7;
  if (difficulty === 3) return 5;
  if (difficulty === 4) return 3;
  return 2; // difficulty 5
}

export function useStageRunner(spec: StageSpec): StageRunnerState {
  const [phase, setPhase] = useState<StagePhase>("READY");
  const [remainingMs, setRemainingMs] = useState(spec.timeLimitMs);
  const [missCount, setMissCount] = useState(0);
  const [result, setResult] = useState<StageResult | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const missCountRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finalize = useCallback(
    (cleared: boolean) => {
      clearTimer();
      const elapsed = Date.now() - startTimeRef.current;
      const stageResult: StageResult = {
        stageId: spec.id,
        cleared,
        elapsedMs: elapsed,
        timeLimitMs: spec.timeLimitMs,
        missCount: missCountRef.current,
      };
      setResult(stageResult);
      setPhase("RESULT");
    },
    [clearTimer, spec.id, spec.timeLimitMs],
  );

  const start = useCallback(() => {
    if (phase !== "READY") return;
    const totalMs = spec.timeLimitMs + GRACE_PERIOD_MS;
    startTimeRef.current = Date.now();
    setRemainingMs(totalMs);
    setMissCount(0);
    missCountRef.current = 0;
    setResult(null);
    setPhase("PLAYING");

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, totalMs - elapsed);
      setRemainingMs(remaining);
      if (remaining <= 0) {
        finalize(false);
      }
    }, TICK_INTERVAL_MS);
  }, [phase, spec.timeLimitMs, finalize]);

  const succeed = useCallback(() => {
    if (phase !== "PLAYING") return;
    finalize(true);
  }, [phase, finalize]);

  const maxMisses = getMaxMisses(spec.difficulty);

  const miss = useCallback(() => {
    if (phase !== "PLAYING") return;
    const newCount = missCountRef.current + 1;
    missCountRef.current = newCount;
    setMissCount(newCount);
    if (newCount >= maxMisses) {
      finalize(false);
    }
  }, [phase, maxMisses, finalize]);

  const reset = useCallback(() => {
    clearTimer();
    setPhase("READY");
    setRemainingMs(spec.timeLimitMs);
    setMissCount(0);
    missCountRef.current = 0;
    setResult(null);
  }, [clearTimer, spec.timeLimitMs]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { phase, remainingMs, missCount, maxMisses, start, succeed, miss, reset, result };
}
