import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import stagesV2 from "../stages/stages.v2.json";
import stagesLegacy from "../stages/stages.mvp.json";
import { trackScreen } from "../analytics/logger";

/**
 * TDS 디자인 토큰 (Toss Design System)
 * @toss/tds-mobile 런타임 미사용 환경에서도 일관된 시각 언어를 유지하기 위한 인라인 토큰
 */
const TDS = {
  grey900: "#191F28",
  grey700: "#4E5968",
  grey500: "#8B95A1",
  grey200: "#E5E8EB",
  grey100: "#F2F4F6",
  grey50: "#F9FAFB",
  blue500: "#3182F6",
  red500: "#E53935",
  white: "#FFFFFF",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  radius12: 12,
  radius8: 8,
} as const;

const difficultyLabel = ["", "Very Easy", "Easy", "Normal", "Hard", "Very Hard"];

export function StageListScreen() {
  const navigate = useNavigate();
  const [showLegacy, setShowLegacy] = useState(false);
  const stageList = (showLegacy ? stagesLegacy : stagesV2) as StageSpec[];

  useEffect(() => {
    trackScreen("stage_list", { version: showLegacy ? "legacy" : "v2" });
  }, [showLegacy]);

  return (
    <div
      style={{
        padding: "20px 16px",
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: TDS.fontFamily,
        minHeight: "100dvh",
        background: TDS.white,
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: TDS.grey900,
          marginBottom: 4,
          letterSpacing: -0.5,
        }}
      >
        Fuck UX
      </h1>
      <p
        style={{
          fontSize: 15,
          color: TDS.grey500,
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        나쁜 UX를 직접 체험하고, 왜 나쁜지 배워보세요.
      </p>

      {/* v2 / Legacy 토글 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setShowLegacy(false)}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            border: `1px solid ${!showLegacy ? TDS.blue500 : TDS.grey200}`,
            borderRadius: TDS.radius8,
            background: !showLegacy ? TDS.blue500 : TDS.white,
            color: !showLegacy ? TDS.white : TDS.grey700,
            cursor: "pointer",
          }}
        >
          v2 ({(stagesV2 as StageSpec[]).length})
        </button>
        <button
          onClick={() => setShowLegacy(true)}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            border: `1px solid ${showLegacy ? TDS.blue500 : TDS.grey200}`,
            borderRadius: TDS.radius8,
            background: showLegacy ? TDS.blue500 : TDS.white,
            color: showLegacy ? TDS.white : TDS.grey700,
            cursor: "pointer",
          }}
        >
          Legacy ({(stagesLegacy as StageSpec[]).length})
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stageList.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => navigate(`/stage/${stage.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px",
              border: `1px solid ${TDS.grey200}`,
              borderRadius: TDS.radius12,
              background: TDS.white,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: TDS.grey500,
                minWidth: 28,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: TDS.grey900,
                  lineHeight: 1.4,
                }}
              >
                {stage.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: TDS.grey700,
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {stage.objective}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                color: stage.difficulty >= 4 ? TDS.red500 : TDS.grey700,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {difficultyLabel[stage.difficulty]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
