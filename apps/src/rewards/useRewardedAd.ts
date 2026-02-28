import { useCallback } from 'react';
// TODO: 토스 심사 제출 시 아래 import + 광고 로직 원복 필요
// import { showRewardedAd } from '../toss-adapter/TossAdapter';
// import { useGameState } from '../game-state/useGameState';

// const AD_GROUP_ID = 'fux-rewarded-001';

export function useRewardedAd() {
  const watchAd = useCallback(async (_stageId: string, _bonusAmount?: number): Promise<boolean> => {
    // TODO: 토스 심사 전까지 광고 바이패스
    return true;
  }, []);

  return { watchAd, loading: false, error: null as string | null, clearError: () => {} };
}
