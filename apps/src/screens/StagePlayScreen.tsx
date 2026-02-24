import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import { findStageById, getSuggestions } from "../stages/findStage";
import { useStageRunner } from "../engine/useStageRunner";
import { StageRenderer } from "../engine/StageRenderer";
import { trackStageStart, trackScreen } from "../analytics/logger";

export function StagePlayScreen() {
  const { stageId } = useParams<{ stageId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId = stageId || searchParams.get("stageId") || "";
  const result = findStageById(rawId);

  if (!result) {
    const suggestions = rawId ? getSuggestions(rawId) : [];
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <p style={{ fontSize: 16, color: "#191F28", fontWeight: 600 }}>스테이지를 찾을 수 없습니다</p>
        {rawId && <p style={{ fontSize: 13, color: "#8B95A1", marginTop: 8 }}>요청된 ID: <code>{rawId}</code></p>}
        {suggestions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, color: "#4E5968", marginBottom: 8 }}>혹시 이 스테이지를 찾으시나요?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              {suggestions.map((id) => (
                <button
                  key={id}
                  onClick={() => navigate(`/stage/${encodeURIComponent(id)}`)}
                  style={{ padding: "8px 16px", fontSize: 13, color: "#3182F6", background: "#F0F4FF", border: "1px solid #3182F6", borderRadius: 8, cursor: "pointer" }}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          style={{ marginTop: 20, padding: "10px 24px", fontSize: 14, fontWeight: 600, background: "#3182F6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  return <StagePlayInner spec={result.stage} />;
}

function StagePlayInner({ spec }: { spec: StageSpec }) {
  const navigate = useNavigate();
  const { phase, remainingMs, start, succeed, miss, result } =
    useStageRunner(spec);

  // Analytics: screen view
  React.useEffect(() => {
    trackScreen("stage_play", { stage_id: spec.id, stage_type: spec.type });
  }, [spec.id, spec.type]);

  // Analytics: stage start
  React.useEffect(() => {
    if (phase === "PLAYING") {
      trackStageStart(spec.id, spec.type, spec.difficulty);
    }
  }, [phase, spec.id, spec.type, spec.difficulty]);

  // Navigate to result screen via useEffect to avoid calling navigate during render
  const shouldNavigate = !!result;
  React.useEffect(() => {
    if (shouldNavigate && result) {
      navigate(`/result/${spec.id}`, { state: result, replace: true });
    }
  }, [shouldNavigate, result, navigate, spec.id]);

  if (shouldNavigate) {
    return null;
  }

  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#fafafa",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            color: "#666",
            cursor: "pointer",
          }}
        >
          ← 목록
        </button>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{spec.title}</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: seconds <= 5 ? "#e53935" : "#333",
            fontVariantNumeric: "tabular-nums",
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {phase === "PLAYING" ? `${seconds}s` : ""}
        </span>
      </div>

      {/* Play area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {phase === "READY" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 16,
              padding: 24,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 16, color: "#333" }}>{spec.objective}</p>
            <button
              onClick={start}
              style={{
                padding: "12px 32px",
                fontSize: 16,
                fontWeight: 600,
                background: "#3182f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              시작하기
            </button>
          </div>
        )}

        {phase === "PLAYING" && (
          <StageRenderer
            spec={spec}
            phase={phase}
            remainingMs={remainingMs}
            onSuccess={succeed}
            onMiss={miss}
          />
        )}
      </div>
    </div>
  );
}
