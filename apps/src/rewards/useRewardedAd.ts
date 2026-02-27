import { useCallback, useState } from 'react';
import { showRewardedAd } from '../toss-adapter/TossAdapter';
import { useGameState } from '../game-state/useGameState';

const AD_GROUP_ID = 'fux-rewarded-001';

export function useRewardedAd() {
  const { dispatch } = useGameState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchAd = useCallback(async (stageId: string, bonusAmount?: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const earned = await showRewardedAd(AD_GROUP_ID);
      if (earned) {
        if (bonusAmount != null) {
          dispatch({
            type: 'ADD_UXP',
            entry: {
              id: `ad-bonus-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'rewarded_ad',
              amount: bonusAmount,
            },
          });
        } else {
          dispatch({ type: 'DOUBLE_REWARD', stageId });
        }
      }
      return earned;
    } catch {
      setError('광고를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const clearError = useCallback(() => setError(null), []);

  return { watchAd, loading, error, clearError };
}
