import { useCallback, useState } from "react";
import type React from "react";

export interface PickerNoSearchParams {
  items: string[];
  targetIndex: number;
  category: string;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

const SIMILAR_ITEMS_POOL = [
  // 광역시/특별시/도
  "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
  "대전광역시", "울산광역시", "세종특별자치시",
  // 경기도 시
  "수원시", "성남시", "고양시", "용인시", "안산시", "안양시", "남양주시",
  "화성시", "평택시", "의정부시", "광명시", "구리시", "하남시", "이천시",
  "안성시", "오산시", "군포시", "의왕시", "여주시", "과천시", "양주시",
  "파주시", "김포시", "광주시", "동두천시", "포천시", "양평군",
  // 경상도 시
  "창원시", "김해시", "포항시", "경주시", "구미시", "안동시", "진주시",
  "통영시", "사천시", "밀양시", "거제시", "양산시", "의령군",
  // 충청도 시
  "청주시", "천안시", "공주시", "보령시", "아산시", "서산시", "논산시",
  "계룡시", "당진시", "충주시", "제천시", "음성군",
  // 전라도 시
  "전주시", "익산시", "군산시", "정읍시", "남원시", "김제시",
  "목포시", "여수시", "순천시", "나주시", "광양시",
  // 강원도 시
  "원주시", "춘천시", "강릉시", "동해시", "태백시", "속초시", "삼척시",
  // 제주
  "제주시", "서귀포시",
];

function generateSimilarItems(targetLabel: string, existing: string[]): string[] {
  return SIMILAR_ITEMS_POOL
    .filter((item) => item !== targetLabel && !existing.includes(item))
    .slice(0, 2);
}

interface StageRendererProps {
  params: PickerNoSearchParams;
  onComplete: () => void;
  onFail: () => void;
}

function shuffleWithMapping(items: string[]): { shuffled: string[]; indexMap: number[] } {
  const indices = items.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  const shuffled = indices.map((i) => items[i]!);
  return { shuffled, indexMap: indices };
}

const CATEGORY_TABS = ["전체", "추천", "인기", "최신", "즐겨찾기"];

export default function PickerNoSearchStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const targetLabel = params.items[params.targetIndex]!;

  const [displayItems, setDisplayItems] = useState<string[]>(() => {
    const { shuffled } = shuffleWithMapping(params.items);
    return shuffled;
  });

  const handleItemClick = useCallback(
    (idx: number) => {
      if (displayItems[idx] === targetLabel) {
        onComplete();
      } else {
        onFail();
        if (params.wrongCloseAddsLayer) {
          setDisplayItems((prev) => {
            if (prev.length >= params.items.length + 8) return prev;
            const similar = generateSimilarItems(targetLabel, prev);
            const canAdd = params.items.length + 8 - prev.length;
            const newItems = [...prev, ...similar.slice(0, canAdd)];
            const copy = [...newItems];
            for (let i = copy.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [copy[i], copy[j]] = [copy[j]!, copy[i]!];
            }
            return copy;
          });
        }
        if (params.shuffleOnMiss) {
          setDisplayItems((prev) => {
            const copy = [...prev];
            for (let i = copy.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [copy[i], copy[j]] = [copy[j]!, copy[i]!];
            }
            return copy;
          });
        }
      }
    },
    [displayItems, targetLabel, params.wrongCloseAddsLayer, params.shuffleOnMiss, onComplete, onFail],
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>{params.category} 선택</h2>
        <div style={objectiveStyle}>
          찾아서 선택하세요: <strong>{targetLabel}</strong>
        </div>
      </div>

      {/* 가짜 비활성화 검색바 */}
      <div style={fakeSearchBarStyle}>
        <span style={fakeSearchIconStyle}>🔍</span>
        <span style={fakeSearchTextStyle}>검색 기능은 현재 비활성화되어 있습니다</span>
      </div>

      {/* 아무 기능도 없는 카테고리 탭 */}
      <div style={tabBarStyle}>
        {CATEGORY_TABS.map((tab, i) => (
          <div key={tab} style={i === 0 ? activeTabStyle : tabStyle}>
            {tab}
          </div>
        ))}
      </div>

      <div style={pickerContainerStyle}>
        {displayItems.map((item, idx) => (
          <button
            key={idx}
            type="button"
            style={itemStyle}
            onClick={() => handleItemClick(idx)}
          >
            <span style={itemTextStyle}>{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  backgroundColor: "#f9fafb",
  padding: "16px",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "12px",
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 8px 0",
};

const objectiveStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4E5968",
  padding: "12px",
  backgroundColor: "#fff3cd",
  borderRadius: 8,
  border: "1px solid #ffc107",
};

const fakeSearchBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  backgroundColor: "#f0f0f0",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  marginBottom: "10px",
  opacity: 0.6,
  cursor: "not-allowed",
};

const fakeSearchIconStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#8B95A1",
};

const fakeSearchTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#8B95A1",
};

const tabBarStyle: React.CSSProperties = {
  display: "flex",
  gap: "4px",
  marginBottom: "10px",
  overflowX: "auto",
};

const tabStyle: React.CSSProperties = {
  padding: "6px 14px",
  fontSize: 13,
  color: "#8B95A1",
  backgroundColor: "#fff",
  border: "1px solid #e5e8eb",
  borderRadius: 20,
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: "#3182F6",
  borderColor: "#3182F6",
  fontWeight: 600,
};

const pickerContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  border: "1px solid #e5e8eb",
  borderRadius: 8,
  backgroundColor: "#fff",
};

const itemStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  border: "none",
  borderBottom: "1px solid #e5e8eb",
  textAlign: "left",
  cursor: "pointer",
  transition: "background-color 0.15s",
  WebkitTapHighlightColor: "transparent",
  backgroundColor: "#fff",
};

const itemTextStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#191F28",
  fontWeight: 400,
};
