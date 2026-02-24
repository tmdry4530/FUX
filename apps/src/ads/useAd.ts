import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { trackAdEvent } from "../analytics/logger";

interface UseAdReturn {
  isLoaded: boolean;
  isShowing: boolean;
  loadAd: () => void;
  showAd: () => Promise<boolean>;
  error: string | null;
  lastReward: boolean;
}

/**
 * IAA 2.0 ver2 통합 광고 훅
 *
 * 공식 API 시그니처:
 * - loadFullScreenAd({ options: { adGroupId }, onEvent, onError }): () => void
 * - showFullScreenAd({ options: { adGroupId }, onEvent, onError }): () => void
 * - loadFullScreenAd.isSupported(): boolean
 *
 * 정책:
 * - load -> show -> load 사이클 준수
 * - userEarnedReward 이벤트에서만 리워드 인정
 * - 컴포넌트 언마운트 시 콜백 해제
 */
export function useAd(adGroupId: string): UseAdReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReward, setLastReward] = useState(false);
  const unmountedRef = useRef(false);
  const unregisterRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      unregisterRef.current?.();
    };
  }, []);

  const loadAd = useCallback(() => {
    if (!loadFullScreenAd.isSupported()) return;

    setError(null);
    setIsLoaded(false);

    unregisterRef.current?.();
    unregisterRef.current = loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (unmountedRef.current) return;
        trackAdEvent("ad_loaded", adGroupId, false);
        if (event.type === "loaded") {
          setIsLoaded(true);
        }
      },
      onError: (err) => {
        if (unmountedRef.current) return;
        trackAdEvent("ad_load_error", adGroupId, false);
        setError(String(err));
        setIsLoaded(false);
      },
    });
  }, [adGroupId]);

  const showAd = useCallback((): Promise<boolean> => {
    if (!showFullScreenAd.isSupported()) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      setIsShowing(true);
      setLastReward(false);
      setError(null);

      let rewarded = false;
      let resolved = false;

      const settle = (value: boolean) => {
        if (resolved) return;
        resolved = true;
        unregister?.();
        resolve(value);
      };

      const unregister = showFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (unmountedRef.current) {
            settle(false);
            return;
          }

          trackAdEvent(event.type, adGroupId, rewarded);

          switch (event.type) {
            case "userEarnedReward":
              rewarded = true;
              setLastReward(true);
              trackAdEvent("ad_reward", adGroupId, true, true);
              break;
            case "dismissed":
              setIsShowing(false);
              setIsLoaded(false);
              settle(rewarded);
              break;
            case "failedToShow":
              setIsShowing(false);
              setError("광고 표시 실패");
              settle(false);
              break;
          }
        },
        onError: (err) => {
          if (unmountedRef.current) return;
          setIsShowing(false);
          setError(String(err));
          settle(false);
        },
      });

      // 클린업 함수 저장
      unregisterRef.current = unregister;
    });
  }, [adGroupId]);

  return { isLoaded, isShowing, loadAd, showAd, error, lastReward };
}
