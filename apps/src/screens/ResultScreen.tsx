import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import type { StageResult } from "../engine/types";
import { findStageById } from "../stages/findStage";
import memeCopies from "../stages/meme-copies.merged.json";
import { AdGate } from "../ads/AdGate";
import { useShare } from "../share/useShare";
import { trackScreen, trackStageEnd, trackShareClick } from "../analytics/logger";

/** TDS 디자인 토큰 */
const TDS = {
  grey900: "#191F28",
  grey700: "#4E5968",
  grey500: "#8B95A1",
  grey200: "#E5E8EB",
  blue500: "#3182F6",
  red500: "#E53935",
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
  const spec = findStageById(stageId)?.stage as StageSpec | undefined;
  const result = location.state as StageResult | null;
  const { shareStage } = useShare();

  const [adTrigger, setAdTrigger] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const cleared = result?.cleared ?? false;

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
        trackStageEnd(stageId, spec.type, spec.difficulty, result.cleared, result.elapsedMs);
      }
    }
  }, [spec, stageId, cleared, result]);

  if (!spec) {
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: TDS.fontFamily }}>
        <p style={{ color: TDS.grey700 }}>스테이지를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate("/")}
          style={{
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
          목록으로
        </button>
      </div>
    );
  }

  const elapsedSec = result ? (result.elapsedMs / 1000).toFixed(1) : "-";
  const missCount = result?.missCount ?? 0;

  const handleShare = async () => {
    const caption = memeText ?? spec.memeCaption;
    const ok = await shareStage(spec.id, caption);
    trackShareClick(spec.id, ok);
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
            setPendingNavigation(`/stage/${spec.id}`);
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
            setPendingNavigation("/");
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
          목록으로
        </button>
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
