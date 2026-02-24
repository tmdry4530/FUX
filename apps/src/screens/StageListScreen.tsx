import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import stagesV3 from "../stages/stages.v3.json";
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

type TabKey = "v3" | "v2" | "legacy";

const v3List = stagesV3 as StageSpec[];
const v2List = stagesV2 as StageSpec[];
const legacyList = stagesLegacy as StageSpec[];

const packLabels: Record<string, string> = {
  "volume-hell": "Volume Hell",
  "web-hell": "Web Hell",
};

export function StageListScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("v3");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPack, setFilterPack] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<number>(0);

  useEffect(() => {
    trackScreen("stage_list", { version: tab });
  }, [tab]);

  const baseList = tab === "v3" ? v3List : tab === "v2" ? v2List : legacyList;

  const filteredList = useMemo(() => {
    let list = baseList;

    if (tab === "v3" && filterPack !== "all") {
      list = list.filter((s) => s.packTag === filterPack);
    }

    if (filterDifficulty > 0) {
      list = list.filter((s) => s.difficulty === filterDifficulty);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.objective.toLowerCase().includes(q),
      );
    }

    return list;
  }, [baseList, tab, filterPack, filterDifficulty, searchQuery]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "v3", label: "V3 Packs", count: v3List.length },
    { key: "v2", label: "V2", count: v2List.length },
    { key: "legacy", label: "Legacy", count: legacyList.length },
  ];

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

      {/* Version tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setFilterPack("all");
              setFilterDifficulty(0);
              setSearchQuery("");
            }}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${tab === t.key ? TDS.blue500 : TDS.grey200}`,
              borderRadius: TDS.radius8,
              background: tab === t.key ? TDS.blue500 : TDS.white,
              color: tab === t.key ? TDS.white : TDS.grey700,
              cursor: "pointer",
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="스테이지 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: 14,
          border: `1px solid ${TDS.grey200}`,
          borderRadius: TDS.radius8,
          marginBottom: 10,
          boxSizing: "border-box",
          outline: "none",
          fontFamily: TDS.fontFamily,
        }}
      />

      {/* Filters (v3 only) */}
      {tab === "v3" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {/* Pack filter */}
          <select
            value={filterPack}
            onChange={(e) => setFilterPack(e.target.value)}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              border: `1px solid ${TDS.grey200}`,
              borderRadius: TDS.radius8,
              background: TDS.white,
              color: TDS.grey700,
              cursor: "pointer",
            }}
          >
            <option value="all">All Packs</option>
            {Object.entries(packLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              border: `1px solid ${TDS.grey200}`,
              borderRadius: TDS.radius8,
              background: TDS.white,
              color: TDS.grey700,
              cursor: "pointer",
            }}
          >
            <option value={0}>All Difficulty</option>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                {difficultyLabel[d]}
              </option>
            ))}
          </select>

          <span style={{ fontSize: 12, color: TDS.grey500, alignSelf: "center" }}>
            {filteredList.length}개
          </span>
        </div>
      )}

      {/* Stage list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredList.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => navigate(`/stage/${encodeURIComponent(stage.id)}`)}
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
              {tab === "v3" && stage.packTag && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 4,
                    padding: "2px 6px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: TDS.blue500,
                    background: TDS.grey100,
                    borderRadius: 4,
                  }}
                >
                  {packLabels[stage.packTag] ?? stage.packTag}
                </span>
              )}
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
