import { useCallback, useEffect, useRef, useState } from "react";
import type { StageSpec } from "../stages/stage-spec";
import type { StagePhase, StageResult, StageRunnerState } from "./types";

const TICK_INTERVAL_MS = 50;

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
    startTimeRef.current = Date.now();
    setRemainingMs(spec.timeLimitMs);
    setMissCount(0);
    missCountRef.current = 0;
    setResult(null);
    setPhase("PLAYING");

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, spec.timeLimitMs - elapsed);
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

  const miss = useCallback(() => {
    if (phase !== "PLAYING") return;
    setMissCount((c) => c + 1);
    missCountRef.current += 1;
  }, [phase]);

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

  return { phase, remainingMs, missCount, start, succeed, miss, reset, result };
}
