import { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import type { StageResult } from "../engine/types";
import stages from "../stages/stages.mvp.json";
import memeCopies from "../stages/meme-copies.merged.json";

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
  const spec = (stages as StageSpec[]).find((s) => s.id === stageId);
  const result = location.state as StageResult | null;

  // 1순위: spec.memeCaption, 2순위: merged JSON에서 랜덤 fallback
  const memeText = useMemo(() => {
    if (spec?.memeCaption) return spec.memeCaption;
    if (stageId) return getRandomMemeCopy(stageId);
    return undefined;
  }, [spec, stageId]);

  if (!spec) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>스테이지를 찾을 수 없습니다.</p>
        <button onClick={() => navigate("/")}>목록으로</button>
      </div>
    );
  }

  const cleared = result?.cleared ?? false;
  const elapsedSec = result ? (result.elapsedMs / 1000).toFixed(1) : "-";
  const missCount = result?.missCount ?? 0;

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
        background: "#fafafa",
      }}
    >
      {/* Result badge */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: cleared ? "#3182f6" : "#e53935",
          marginBottom: 8,
        }}
      >
        {cleared ? "CLEAR" : "FAIL"}
      </div>

      {/* Meme caption */}
      <p
        style={{
          fontSize: 16,
          color: "#555",
          marginBottom: 24,
          maxWidth: 320,
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
          fontSize: 14,
          color: "#666",
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>시간</div>
          <div>{elapsedSec}s</div>
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>미스</div>
          <div>{missCount}회</div>
        </div>
      </div>

      {/* Explain why bad */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 16,
          maxWidth: 360,
          marginBottom: 32,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#3182f6",
            marginBottom: 6,
          }}
        >
          왜 나쁜 UX일까?
        </div>
        <p style={{ fontSize: 14, color: "#333", lineHeight: 1.6, margin: 0 }}>
          {spec.explainWhyBad}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => navigate(`/stage/${spec.id}`, { replace: true })}
          style={{
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          다시 도전
        </button>
        <button
          onClick={() => navigate("/", { replace: true })}
          style={{
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            background: "#3182f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          목록으로
        </button>
      </div>
    </div>
  );
}
