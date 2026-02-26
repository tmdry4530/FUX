import { useCallback, useMemo } from 'react';
import { useGameState } from '../game-state/useGameState';
import { generateDailyChallenge, getTodayKST, createChallengeProgress } from './generateDailyChallenge';

export function useDailyChallenge() {
  const { state, dispatch } = useGameState();
  const today = getTodayKST();

  const stages = useMemo(() => generateDailyChallenge(today), [today]);

  const progress = useMemo(() => {
    if (state.challengeProgress?.date === today) {
      return state.challengeProgress;
    }
    return null;
  }, [state.challengeProgress, today]);

  const initChallenge = useCallback(() => {
    if (progress) return progress;
    const newProgress = createChallengeProgress(today, stages);
    dispatch({ type: 'SET_CHALLENGE_PROGRESS', progress: newProgress });
    return newProgress;
  }, [progress, today, stages, dispatch]);

  const currentStepIndex = useMemo(() => {
    if (!progress) return 0;
    const idx = progress.steps.findIndex((s) => s.status === 'unlocked');
    return idx === -1 ? progress.steps.length : idx;
  }, [progress]);

  const clearedCount = useMemo(() => {
    if (!progress) return 0;
    return progress.steps.filter((s) => s.status === 'cleared').length;
  }, [progress]);

  return {
    today,
    stages,
    progress,
    initChallenge,
    currentStepIndex,
    clearedCount,
    totalSteps: DIFFICULTY_SLOTS_COUNT,
  };
}

const DIFFICULTY_SLOTS_COUNT = 6;
