import { useCallback, useState } from 'react';
import { showRewardedAd } from '../toss-adapter/TossAdapter';
import { useGameState } from '../game-state/useGameState';

const AD_GROUP_ID = 'fux-rewarded-001';

export function useRewardedAd() {
  const { dispatch } = useGameState();
  const [loading, setLoading] = useState(false);

  const watchAd = useCallback(async (stageId: string, bonusAmount?: number): Promise<boolean> => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return { watchAd, loading };
}
