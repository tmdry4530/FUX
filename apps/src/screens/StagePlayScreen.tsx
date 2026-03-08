import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import { findStageById, getSuggestions } from "../stages/findStage";
import { useStageRunner } from "../engine/useStageRunner";
import { StageRenderer } from "../engine/StageRenderer";
import { trackStageStart, trackScreen } from "../analytics/logger";
import { TDS } from "../styles/tds";

export function StagePlayScreen() {
  const { stageId } = useParams<{ stageId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId = stageId || searchParams.get("stageId") || "";
  const result = findStageById(rawId);

  if (!result) {
    const suggestions = rawId ? getSuggestions(rawId) : [];
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: TDS.fontFamily, minHeight: '100dvh', background: TDS.bgGrey }}>
        <p style={{ fontSize: 16, color: TDS.grey900, fontWeight: 600 }}>스테이지를 찾을 수 없습니다</p>
        {rawId && <p style={{ fontSize: 13, color: TDS.grey500, marginTop: 8 }}>요청된 ID: <code>{rawId}</code></p>}
        {suggestions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, color: TDS.grey700, marginBottom: 8 }}>혹시 이 스테이지를 찾으시나요?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/stage/${encodeURIComponent(s.id)}`)}
                  style={{ padding: "10px 20px", fontSize: 13, color: TDS.blue500, background: TDS.blue100, border: `1px solid ${TDS.blue500}`, borderRadius: TDS.radius12, cursor: "pointer" }}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          style={{ marginTop: 20, padding: "12px 28px", fontSize: 15, fontWeight: 600, background: TDS.blue500, color: TDS.white, border: "none", borderRadius: TDS.radius12, cursor: "pointer" }}
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
  const [searchParams] = useSearchParams();
  const { phase, remainingMs, missCount, maxMisses, start, succeed, miss, result } =
    useStageRunner(spec);

  React.useEffect(() => {
    trackScreen("stage_play", { stage_id: spec.id, stage_type: spec.type });
  }, [spec.id, spec.type]);

  React.useEffect(() => {
    if (phase === "PLAYING") {
      const extra: Record<string, string | number | boolean> = {};
      if (spec.packTag) extra.pack_tag = spec.packTag;
      if (spec.patternTag) extra.pattern_tag = spec.patternTag;
      if (spec.sourceTag) extra.source_tag = spec.sourceTag;
      trackStageStart(spec.id, spec.type, spec.difficulty, extra);
    }
  }, [phase, spec.id, spec.type, spec.difficulty, spec.packTag, spec.patternTag, spec.sourceTag]);

  const shouldNavigate = !!result;
  React.useEffect(() => {
    if (shouldNavigate && result) {
      const challengeParam = searchParams.get('challenge');
      const stepParam = searchParams.get('step');
      const hardParam = searchParams.get('hard');
      const resultUrl = challengeParam
        ? `/result/${spec.id}?challenge=1&step=${stepParam ?? '0'}`
        : hardParam
          ? `/result/${spec.id}?hard=1`
          : `/result/${spec.id}`;
      navigate(resultUrl, { state: result, replace: true });
    }
  }, [shouldNavigate, result, navigate, spec.id, searchParams]);

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
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 44px)",
        background: TDS.white,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 44,
          padding: "0 16px",
          borderBottom: `1px solid ${TDS.grey100}`,
        }}
      >
        <button
          onClick={() => navigate(searchParams.get('challenge') === '1' ? '/challenge' : '/')}
          style={{
            background: "none",
            border: "none",
            fontSize: 16,
            color: TDS.grey900,
            cursor: "pointer",
            padding: '4px 8px 4px 0',
          }}
        >
          ←
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: TDS.grey900 }}>{spec.title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {phase === "PLAYING" && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: missCount >= maxMisses - 1 ? TDS.red500 : TDS.grey500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {missCount}/{maxMisses}
            </span>
          )}
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: seconds <= 5 ? TDS.red500 : TDS.grey900,
              fontVariantNumeric: "tabular-nums",
              minWidth: 32,
              textAlign: "right",
            }}
          >
            {phase === "PLAYING" ? `${seconds}s` : ""}
          </span>
        </div>
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
              gap: 20,
              padding: 24,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 17, color: TDS.grey800, lineHeight: 1.5 }}>{spec.objective}</p>
            <button
              onClick={start}
              style={{
                padding: "14px 40px",
                fontSize: 16,
                fontWeight: 600,
                background: TDS.blue500,
                color: TDS.white,
                border: "none",
                borderRadius: TDS.radius12,
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
