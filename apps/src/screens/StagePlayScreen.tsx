import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import stages from "../stages/stages.mvp.json";
import { useStageRunner } from "../engine/useStageRunner";
import { StageRenderer } from "../engine/StageRenderer";

export function StagePlayScreen() {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const spec = (stages as StageSpec[]).find((s) => s.id === stageId);

  if (!spec) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>스테이지를 찾을 수 없습니다.</p>
        <button onClick={() => navigate("/")}>목록으로</button>
      </div>
    );
  }

  return <StagePlayInner spec={spec} />;
}

function StagePlayInner({ spec }: { spec: StageSpec }) {
  const navigate = useNavigate();
  const { phase, remainingMs, start, succeed, miss, result } =
    useStageRunner(spec);

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
