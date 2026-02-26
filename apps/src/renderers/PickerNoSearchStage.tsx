import { useCallback, useState } from "react";
import type React from "react";

export interface PickerNoSearchParams {
  items: string[];
  targetIndex: number;
  category: string;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

const SIMILAR_ITEMS_POOL: Record<string, string[]> = {
  지역: [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
    "대전광역시", "울산광역시", "세종특별자치시",
    "수원시", "성남시", "고양시", "용인시", "안산시", "안양시", "남양주시",
    "화성시", "평택시", "의정부시", "광명시", "구리시", "하남시", "이천시",
    "창원시", "김해시", "포항시", "경주시", "구미시", "안동시", "진주시",
    "청주시", "천안시", "공주시", "아산시", "서산시", "충주시", "제천시",
    "전주시", "익산시", "군산시", "목포시", "여수시", "순천시", "광양시",
    "원주시", "춘천시", "강릉시", "동해시", "속초시", "제주시", "서귀포시",
  ],
  은행: [
    "국민은행", "신한은행", "하나은행", "우리은행", "기업은행",
    "농협은행", "카카오뱅크", "토스뱅크", "케이뱅크", "씨티은행",
    "SC제일은행", "광주은행", "전북은행", "경남은행", "대구은행",
  ],
  카드: [
    "신한카드", "삼성카드", "현대카드", "KB국민카드", "롯데카드",
    "하나카드", "우리카드", "BC카드", "농협카드", "씨티카드",
    "카카오페이카드", "토스카드", "케이뱅크카드", "IBK기업카드",
  ],
  통신사: [
    "SK텔레콤", "KT", "LG유플러스", "SK브로드밴드", "KT스카이라이프",
    "헬로모바일", "KT엠모바일", "SK세븐모바일", "U+알뜰모바일", "이야기모바일",
    "스노우맨", "뷰티모바일", "프리텔레콤", "아이즈모바일",
  ],
  보험사: [
    "삼성생명", "한화생명", "교보생명", "NH농협생명", "신한라이프",
    "삼성화재", "현대해상", "DB손해보험", "KB손해보험", "메리츠화재",
    "흥국화재", "롯데손해보험", "MG손해보험", "하나생명",
  ],
  default: [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
    "대전광역시", "울산광역시", "세종특별자치시",
    "수원시", "성남시", "고양시", "용인시", "안산시", "안양시", "남양주시",
    "화성시", "평택시", "의정부시",
  ],
};

function generateSimilarItems(targetLabel: string, existing: string[], category?: string): string[] {
  const categoryKey = category && category in SIMILAR_ITEMS_POOL ? category : "default";
  const pool = SIMILAR_ITEMS_POOL[categoryKey] ?? SIMILAR_ITEMS_POOL["default"]!;

  // Check if any category keyword matches
  let resolvedPool = pool;
  if (categoryKey === "default") {
    for (const [key, items] of Object.entries(SIMILAR_ITEMS_POOL)) {
      if (key !== "default" && category && category.includes(key)) {
        resolvedPool = items;
        break;
      }
    }
  }

  return resolvedPool
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
            const similar = generateSimilarItems(targetLabel, prev, params.category);
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
