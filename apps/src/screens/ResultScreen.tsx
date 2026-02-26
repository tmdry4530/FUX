import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import type { StageResult } from "../engine/types";
import { findStageById, getNextStageId } from "../stages/findStage";
import memeCopies from "../stages/meme-copies.merged.json";
import { AdGate } from "../ads/AdGate";
import { useShare } from "../share/useShare";
import { trackScreen, trackStageEnd, trackShareClick } from "../analytics/logger";
import { useGameState } from "../game-state/useGameState";
import { useRewardedAd } from "../rewards/useRewardedAd";
import { calculateUXP } from "../rewards/uxp-calculator";

/** TDS 디자인 토큰 */
const TDS = {
  grey900: "#191F28",
  grey700: "#4E5968",
  grey500: "#8B95A1",
  grey200: "#E5E8EB",
  grey100: "#F2F4F6",
  grey50: "#F9FAFB",
  blue500: "#3182F6",
  red500: "#E53935",
  orange500: "#F59F00",
  white: "#FFFFFF",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  radius12: 12,
  radius8: 8,
} as const;

function getRandomMemeCopy(stageId: string): string | undefined {
  const copies = memeCopies.filter((c) => c.stageId === stageId);
  if (copies.length === 0) return undefined;
  const pick = copies[Math.floor(Math.random() * copies.length)];
  return pick?.resultScreenCopy;
}

export function ResultScreen() {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const spec = findStageById(stageId)?.stage as StageSpec | undefined;
  const result = location.state as StageResult | null;
  const { shareStage } = useShare();
  const { state, dispatch } = useGameState();
  const { watchAd, loading: adLoading } = useRewardedAd();

  const isChallengeMode = searchParams.get('challenge') === '1';
  const currentStep = Number(searchParams.get('step') ?? '0');

  // 챌린지 모드: 다음 단계 정보
  const nextChallengeStep = (() => {
    if (!isChallengeMode || !state.challengeProgress) return null;
    const nextIdx = currentStep + 1;
    const nextStep = state.challengeProgress.steps[nextIdx];
    if (!nextStep) return null;
    return { index: nextIdx, stageId: nextStep.stageId };
  })();

  const [adTrigger, setAdTrigger] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [uxpAwarded, setUxpAwarded] = useState(false);

  const cleared = result?.cleared ?? false;

  // UXP 계산
  const isFirstClear = spec && result?.cleared
    ? !state.collection.clearedStageIds.includes(spec.id)
    : false;
  const uxpBreakdown = spec && result
    ? calculateUXP(spec, result, isFirstClear)
    : null;

  // UXP 적립 + 컬렉션 기록 + 챌린지 스텝 업데이트 (1회만)
  useEffect(() => {
    if (!spec || !result || uxpAwarded) return;

    // UXP 적립 (클리어 시)
    if (uxpBreakdown && uxpBreakdown.total > 0) {
      dispatch({
        type: 'ADD_UXP',
        entry: {
          id: `stage-${spec.id}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'stage_clear',
          amount: uxpBreakdown.total,
          stageId: spec.id,
        },
      });
      dispatch({ type: 'ADD_CLEARED_STAGE', stageId: spec.id });
    }

    // 챌린지 모드: 스텝 업데이트
    if (isChallengeMode) {
      const stepParam = searchParams.get('step');
      const stepIndex = stepParam !== null ? Number(stepParam) : -1;
      if (stepIndex >= 0) {
        dispatch({
          type: 'UPDATE_CHALLENGE_STEP',
          stepIndex,
          status: result.cleared ? 'cleared' : 'failed',
          result: {
            elapsedMs: result.elapsedMs,
            missCount: result.missCount,
            uxpEarned: uxpBreakdown?.total ?? 0,
          },
        });
      }
    }

    setUxpAwarded(true);
  }, [uxpBreakdown, spec, result, uxpAwarded, dispatch, isChallengeMode, searchParams]);

  // 1순위: spec.memeCaption, 2순위: merged JSON에서 랜덤 fallback
  const memeText = useMemo(() => {
    if (spec?.memeCaption) return spec.memeCaption;
    if (stageId) return getRandomMemeCopy(stageId);
    return undefined;
  }, [spec, stageId]);

  // Analytics: screen view + stage result
  useEffect(() => {
    if (spec && stageId) {
      trackScreen("result_screen", { stage_id: stageId, cleared });
      if (result) {
        const extra: Record<string, string | number | boolean> = {};
        if (spec.packTag) extra.pack_tag = spec.packTag;
        if (spec.patternTag) extra.pattern_tag = spec.patternTag;
        if (spec.sourceTag) extra.source_tag = spec.sourceTag;
        trackStageEnd(stageId, spec.type, spec.difficulty, result.cleared, result.elapsedMs, extra);
      }
    }
  }, [spec, stageId, cleared, result]);

  if (!spec) {
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: TDS.fontFamily }}>
        <p style={{ fontSize: 16, color: TDS.grey900, fontWeight: 600 }}>스테이지를 찾을 수 없습니다</p>
        {stageId && (
          <p style={{ fontSize: 13, color: TDS.grey500, marginTop: 8 }}>
            요청된 ID: <code>{stageId}</code>
          </p>
        )}
        <p style={{ fontSize: 13, color: TDS.grey700, marginTop: 12 }}>
          게임을 먼저 플레이한 후 결과를 확인할 수 있습니다.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: 20,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            background: TDS.blue500,
            color: TDS.white,
            border: "none",
            borderRadius: TDS.radius8,
            cursor: "pointer",
          }}
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  const elapsedSec = result ? (result.elapsedMs / 1000).toFixed(1) : "-";
  const missCount = result?.missCount ?? 0;
  const nextStageId = spec ? getNextStageId(spec.id) : null;

  const handleShare = async () => {
    const caption = memeText ?? spec.memeCaption;
    const ok = await shareStage(spec.id, caption);
    trackShareClick(spec.id, ok);
    setShareToast(ok ? "공유 링크가 복사되었습니다!" : "공유에 실패했습니다.");
    setTimeout(() => setShareToast(null), 2500);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: 24,
        textAlign: "center",
        background: TDS.white,
        fontFamily: TDS.fontFamily,
      }}
    >
      {/* Result badge */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: cleared ? TDS.blue500 : TDS.red500,
          marginBottom: 8,
          letterSpacing: -1,
        }}
      >
        {cleared ? "CLEAR" : "FAIL"}
      </div>

      {/* Meme caption */}
      <p
        style={{
          fontSize: 16,
          color: TDS.grey700,
          marginBottom: 24,
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        {memeText ?? spec.memeCaption}
      </p>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginBottom: 24,
          fontSize: 14,
          color: TDS.grey700,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: TDS.grey500, fontSize: 12, marginBottom: 4 }}>
            시간
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: TDS.grey900 }}>{elapsedSec}s</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: TDS.grey500, fontSize: 12, marginBottom: 4 }}>
            미스
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: TDS.grey900 }}>{missCount}회</div>
        </div>
      </div>

      {/* UXP 획득 표시 */}
      {uxpBreakdown && uxpBreakdown.total > 0 && (
        <div style={{
          background: '#E8F3FF',
          borderRadius: TDS.radius12,
          padding: 16,
          marginBottom: 16,
          maxWidth: 360,
          width: '100%',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: TDS.blue500, marginBottom: 4 }}>
            +{uxpBreakdown.total} UX력 획득!
          </div>
          <div style={{ fontSize: 12, color: TDS.grey700 }}>
            {uxpBreakdown.timeBonus > 0 && <span>시간 보너스 +{uxpBreakdown.timeBonus} · </span>}
            {uxpBreakdown.noMissBonus > 0 && <span>노미스 보너스 +{uxpBreakdown.noMissBonus} · </span>}
            {uxpBreakdown.firstClearBonus > 0 && <span>최초 클리어 +{uxpBreakdown.firstClearBonus}</span>}
          </div>

          {/* 보상형 광고 버튼 */}
          <button
            onClick={async () => {
              if (spec) await watchAd(spec.id);
            }}
            disabled={adLoading}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '12px',
              fontSize: 14,
              fontWeight: 600,
              background: adLoading ? TDS.grey200 : TDS.orange500,
              color: TDS.white,
              border: 'none',
              borderRadius: TDS.radius8,
              cursor: adLoading ? 'default' : 'pointer',
            }}
          >
            {adLoading ? '광고 로딩중...' : `광고 보고 2배 받기 → +${uxpBreakdown.total} UX력`}
          </button>
        </div>
      )}

      {/* Explain why bad */}
      <div
        style={{
          background: TDS.white,
          border: `1px solid ${TDS.grey200}`,
          borderRadius: TDS.radius12,
          padding: 16,
          maxWidth: 360,
          marginBottom: 32,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: TDS.blue500,
            marginBottom: 8,
          }}
        >
          왜 나쁜 UX일까?
        </div>
        <p style={{ fontSize: 14, color: TDS.grey900, lineHeight: 1.6, margin: 0 }}>
          {spec.explainWhyBad}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => {
            const retryUrl = isChallengeMode
              ? `/stage/${encodeURIComponent(spec.id)}?challenge=1&step=${currentStep}`
              : `/stage/${encodeURIComponent(spec.id)}`;
            setPendingNavigation(retryUrl);
            setAdTrigger(true);
          }}
          style={{
            padding: "14px 24px",
            fontSize: 14,
            fontWeight: 600,
            background: TDS.white,
            color: TDS.grey900,
            border: `1px solid ${TDS.grey200}`,
            borderRadius: TDS.radius8,
            cursor: "pointer",
          }}
        >
          다시 도전
        </button>
        <button
          onClick={() => {
            setPendingNavigation(isChallengeMode ? "/challenge" : "/");
            setAdTrigger(true);
          }}
          style={{
            padding: "14px 24px",
            fontSize: 14,
            fontWeight: 600,
            background: TDS.white,
            color: TDS.grey900,
            border: `1px solid ${TDS.grey200}`,
            borderRadius: TDS.radius8,
            cursor: "pointer",
          }}
        >
          {isChallengeMode ? "챌린지로" : "목록으로"}
        </button>
        {isChallengeMode ? (
          nextChallengeStep ? (
            <button
              onClick={() => {
                setPendingNavigation(
                  `/stage/${encodeURIComponent(nextChallengeStep.stageId)}?challenge=1&step=${nextChallengeStep.index}`
                );
                setAdTrigger(true);
              }}
              style={{
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 600,
                background: TDS.blue500,
                color: TDS.white,
                border: "none",
                borderRadius: TDS.radius8,
                cursor: "pointer",
              }}
            >
              다음 단계
            </button>
          ) : (
            <button
              onClick={() => {
                setPendingNavigation("/challenge");
                setAdTrigger(true);
              }}
              style={{
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 600,
                background: TDS.blue500,
                color: TDS.white,
                border: "none",
                borderRadius: TDS.radius8,
                cursor: "pointer",
              }}
            >
              챌린지 완료
            </button>
          )
        ) : (
          nextStageId && (
            <button
              onClick={() => {
                setPendingNavigation(`/stage/${nextStageId}`);
                setAdTrigger(true);
              }}
              style={{
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 600,
                background: TDS.blue500,
                color: TDS.white,
                border: "none",
                borderRadius: TDS.radius8,
                cursor: "pointer",
              }}
            >
              다음 스테이지
            </button>
          )
        )}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        style={{
          padding: "10px 20px",
          fontSize: 13,
          fontWeight: 600,
          background: "transparent",
          color: TDS.blue500,
          border: `1px solid ${TDS.blue500}`,
          borderRadius: TDS.radius8,
          cursor: "pointer",
        }}
      >
        친구에게 공유하기
      </button>

      {/* Share toast */}
      {shareToast && (
        <div
          style={{
            position: "fixed",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: TDS.white,
            background: TDS.grey900,
            borderRadius: TDS.radius8,
            zIndex: 1000,
            opacity: 0.95,
          }}
        >
          {shareToast}
        </div>
      )}

      {/* AdGate: 결과 화면 전환 시에만 광고 표시 */}
      <AdGate
        trigger={adTrigger}
        rewarded={false}
        onComplete={() => {
          if (pendingNavigation) {
            navigate(pendingNavigation, { replace: true });
          }
        }}
        onSkip={() => {
          if (pendingNavigation) {
            navigate(pendingNavigation, { replace: true });
          }
        }}
      />
    </div>
  );
}
