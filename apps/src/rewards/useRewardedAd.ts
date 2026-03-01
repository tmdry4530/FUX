import { useCallback, useEffect, useState } from 'react';
import { useAd } from '../ads/useAd';
import { AD_GROUP_REWARDED } from '../ads/constants';

export function useRewardedAd() {
  const { isLoaded, loadAd, showAd, error: adError } = useAd(AD_GROUP_REWARDED);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  const watchAd = useCallback(async (_stageId: string, _bonusAmount?: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 1) 실제 광고 지원 시: showAd() 호출
      if (isLoaded) {
        const result = await showAd();
        // 광고 소진 후 다음 광고 프리로드
        loadAd();
        return result;
      }
      // 2) 미지원 (dev): 모의 광고 (3초 대기)
      await new Promise(r => setTimeout(r, 3000));
      return true;
    } catch {
      setError('광고 로드 실패');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isLoaded, showAd, loadAd]);

  const clearError = useCallback(() => setError(null), []);

  return { watchAd, loading, error: error ?? adError, clearError };
}
