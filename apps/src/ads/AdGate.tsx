import { useCallback, useEffect, useRef } from "react";
import { useAd } from "./useAd";
import { AD_GROUP_INTERSTITIAL, AD_GROUP_REWARDED } from "./constants";

interface AdGateProps {
  /** 광고 표시 트리거 - true로 바뀌면 광고 시도 */
  trigger: boolean;
  /** 보상형 광고 여부 (기본: false = 전면 광고) */
  rewarded?: boolean;
  /** 광고 완료 콜백 (보상형: rewarded 여부 전달) */
  onComplete: (rewarded: boolean) => void;
  /** 광고 건너뛰기 콜백 (광고 미지원 or 로드 실패 시) */
  onSkip?: () => void;
}

/**
 * AdGate - 자연스러운 전환 지점에서 광고를 표시하는 컴포넌트
 *
 * 정책:
 * - 첫 진입 시 광고 금지 (진입 시 광고 금지)
 * - 스테이지 사이 전환, 결과 화면 후 등 자연스러운 전환점에서만 사용
 * - 보상형 광고: userEarnedReward 이벤트에서만 보상 지급, dismissed만으로는 보상 없음
 * - dismissed 후 다음 광고 자동 프리로드
 */
export function AdGate({
  trigger,
  rewarded = false,
  onComplete,
  onSkip,
}: AdGateProps) {
  const adGroupId = rewarded ? AD_GROUP_REWARDED : AD_GROUP_INTERSTITIAL;
  const { isLoaded, loadAd, showAd, error } = useAd(adGroupId);
  const hasTriggered = useRef(false);
  const isFirstEntry = useRef(true);

  // 컴포넌트 마운트 시 광고 프리로드
  useEffect(() => {
    loadAd();
  }, [loadAd]);

  // 첫 진입 플래그 해제 (마운트 직후)
  useEffect(() => {
    const timer = setTimeout(() => {
      isFirstEntry.current = false;
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const attemptShow = useCallback(async () => {
    // 첫 진입 시 광고 금지
    if (isFirstEntry.current) {
      onSkip?.();
      return;
    }

    if (!isLoaded) {
      onSkip?.();
      return;
    }

    const wasRewarded = await showAd();
    onComplete(wasRewarded);

    // dismissed 후 다음 광고 프리로드
    loadAd();
  }, [isLoaded, showAd, loadAd, onComplete, onSkip]);

  // trigger 변경 시 광고 표시 시도
  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      attemptShow();
    }
    if (!trigger) {
      hasTriggered.current = false;
    }
  }, [trigger, attemptShow]);

  // 에러 발생 시 스킵 처리
  useEffect(() => {
    if (error && hasTriggered.current) {
      onSkip?.();
    }
  }, [error, onSkip]);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (광고는 전면/보상형으로 네이티브 표시)
  return null;
}
