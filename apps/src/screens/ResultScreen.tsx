import { useEffect, useMemo, useRef, useState } from "react";
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
import { TDS, cardStyle } from "../styles/tds";

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
  const isHardMode = searchParams.get('hard') === '1';
  const currentStep = Number(searchParams.get('step') ?? '0');

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
  const [adErrorToast, setAdErrorToast] = useState<string | null>(null);
  const [retryAdLoading, setRetryAdLoading] = useState(false);
  const uxpAwardedRef = useRef(false);

  const cleared = result?.cleared ?? false;

  const isFirstClear = spec && result?.cleared
    ? !state.collection.clearedStageIds.includes(spec.id)
    : false;
  const uxpBreakdown = spec && result
    ? calculateUXP(spec, result, isFirstClear)
    : null;

  useEffect(() => {
    if (!spec || !result || uxpAwardedRef.current) return;
    uxpAwardedRef.current = true;

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
  }, [uxpBreakdown, spec, result, dispatch, isChallengeMode, searchParams]);

  const memeText = useMemo(() => {
    if (spec?.memeCaption) return spec.memeCaption;
    if (stageId) return getRandomMemeCopy(stageId);
    return undefined;
  }, [spec, stageId]);

  const analyticsTrackedRef = useRef(false);
  useEffect(() => {
    if (analyticsTrackedRef.current) return;
    if (spec && stageId) {
      analyticsTrackedRef.current = true;
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
      <div style={{ padding: 24, textAlign: "center", fontFamily: TDS.fontFamily, minHeight: '100dvh', background: TDS.bgGrey }}>
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
            padding: "14px 28px",
            fontSize: 15,
            fontWeight: 600,
            background: TDS.blue500,
            color: TDS.white,
            border: "none",
            borderRadius: TDS.radius12,
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
        padding: "calc(env(safe-area-inset-top, 0px) + 24px) 20px 24px",
        textAlign: "center",
        background: TDS.bgGrey,
        fontFamily: TDS.fontFamily,
      }}
    >
      {/* Result badge */}
      <div
        style={{
          fontSize: 52,
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
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div style={{
          ...cardStyle,
          padding: '16px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontWeight: 600, color: TDS.grey500, fontSize: 12, marginBottom: 6 }}>
            시간
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: TDS.grey900 }}>{elapsedSec}s</div>
        </div>
        <div style={{
          ...cardStyle,
          padding: '16px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontWeight: 600, color: TDS.grey500, fontSize: 12, marginBottom: 6 }}>
            미스
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: TDS.grey900 }}>{missCount}회</div>
        </div>
      </div>

      {/* UXP 획득 표시 */}
      {uxpBreakdown && uxpBreakdown.total > 0 && (
        <div style={{
          ...cardStyle,
          padding: '20px',
          marginBottom: 16,
          maxWidth: 360,
          width: '100%',
          background: TDS.blue100,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: TDS.blue500, marginBottom: 6 }}>
            +{uxpBreakdown.total} UX력 획득!
          </div>
          <div style={{ fontSize: 13, color: TDS.grey700 }}>
            {uxpBreakdown.timeBonus > 0 && <span>시간 보너스 +{uxpBreakdown.timeBonus} · </span>}
            {uxpBreakdown.noMissBonus > 0 && <span>노미스 보너스 +{uxpBreakdown.noMissBonus} · </span>}
            {uxpBreakdown.firstClearBonus > 0 && <span>최초 클리어 +{uxpBreakdown.firstClearBonus}</span>}
          </div>

          <button
            onClick={async () => {
              if (spec) {
                const ok = await watchAd(spec.id);
                if (!ok) {
                  setAdErrorToast('광고를 불러올 수 없습니다.');
                  setTimeout(() => setAdErrorToast(null), 2500);
                }
              }
            }}
            disabled={adLoading}
            style={{
              marginTop: 14,
              width: '100%',
              height: 48,
              fontSize: 15,
              fontWeight: 600,
              background: adLoading ? TDS.grey200 : TDS.orange500,
              color: TDS.white,
              border: 'none',
              borderRadius: TDS.radius12,
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
          ...cardStyle,
          padding: '20px',
          maxWidth: 360,
          marginBottom: 32,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: TDS.blue500,
            marginBottom: 10,
          }}
        >
          왜 나쁜 UX일까?
        </div>
        <p style={{ fontSize: 14, color: TDS.grey900, lineHeight: 1.6, margin: 0 }}>
          {spec.explainWhyBad}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {isHardMode ? (
          <button
            onClick={() => {
              setPendingNavigation("/");
              setAdTrigger(true);
            }}
            style={{
              padding: "14px 28px",
              fontSize: 15,
              fontWeight: 600,
              background: TDS.blue500,
              color: TDS.white,
              border: "none",
              borderRadius: TDS.radius12,
              cursor: "pointer",
            }}
          >
            홈으로
          </button>
        ) : (
          <>
            <button
              onClick={async () => {
                const retryUrl = isChallengeMode
                  ? `/stage/${encodeURIComponent(spec.id)}?challenge=1&step=${currentStep}`
                  : `/stage/${encodeURIComponent(spec.id)}`;
                if (isChallengeMode && !cleared) {
                  setRetryAdLoading(true);
                  const ok = await watchAd(spec.id, 0);
                  setRetryAdLoading(false);
                  if (ok) {
                    navigate(retryUrl, { replace: true });
                  } else {
                    setAdErrorToast('광고를 시청해야 재도전할 수 있습니다.');
                    setTimeout(() => setAdErrorToast(null), 2500);
                  }
                } else {
                  setPendingNavigation(retryUrl);
                  setAdTrigger(true);
                }
              }}
              disabled={retryAdLoading}
              style={{
                padding: "14px 24px",
                fontSize: 15,
                fontWeight: 600,
                background: isChallengeMode && !cleared ? TDS.orange500 : TDS.white,
                color: isChallengeMode && !cleared ? TDS.white : TDS.grey900,
                border: isChallengeMode && !cleared ? 'none' : `1px solid ${TDS.grey200}`,
                borderRadius: TDS.radius12,
                cursor: retryAdLoading ? "default" : "pointer",
                boxShadow: isChallengeMode && !cleared ? 'none' : TDS.shadowCard,
              }}
            >
              {retryAdLoading ? '광고 로딩중...' : isChallengeMode && !cleared ? '광고 보고 재도전' : '다시 도전'}
            </button>
            <button
              onClick={() => {
                setPendingNavigation(isChallengeMode ? "/challenge" : "/");
                setAdTrigger(true);
              }}
              style={{
                padding: "14px 24px",
                fontSize: 15,
                fontWeight: 600,
                background: TDS.white,
                color: TDS.grey900,
                border: `1px solid ${TDS.grey200}`,
                borderRadius: TDS.radius12,
                cursor: "pointer",
                boxShadow: TDS.shadowCard,
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
                    fontSize: 15,
                    fontWeight: 600,
                    background: TDS.blue500,
                    color: TDS.white,
                    border: "none",
                    borderRadius: TDS.radius12,
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
                    fontSize: 15,
                    fontWeight: 600,
                    background: TDS.blue500,
                    color: TDS.white,
                    border: "none",
                    borderRadius: TDS.radius12,
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
                    fontSize: 15,
                    fontWeight: 600,
                    background: TDS.blue500,
                    color: TDS.white,
                    border: "none",
                    borderRadius: TDS.radius12,
                    cursor: "pointer",
                  }}
                >
                  다음 스테이지
                </button>
              )
            )}
          </>
        )}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        style={{
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 600,
          background: "transparent",
          color: TDS.blue500,
          border: `1px solid ${TDS.blue500}`,
          borderRadius: 24,
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
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            color: TDS.white,
            background: TDS.grey900,
            borderRadius: 24,
            zIndex: 1000,
            boxShadow: TDS.shadowElevated,
          }}
        >
          {shareToast}
        </div>
      )}

      {/* 광고 실패 토스트 */}
      {adErrorToast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            color: TDS.white,
            background: TDS.red500,
            borderRadius: 24,
            zIndex: 1000,
            boxShadow: TDS.shadowElevated,
          }}
        >
          {adErrorToast}
        </div>
      )}

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
