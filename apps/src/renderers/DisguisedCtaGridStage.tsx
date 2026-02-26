import { useState, useCallback, useMemo } from "react";
import type React from "react";

export interface DisguisedCtaGridParams {
  gridSize: number;
  disguisedCount: number;
  showSimBadge: boolean;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface StageRendererProps {
  params: DisguisedCtaGridParams;
  onComplete: () => void;
  onFail: () => void;
}

interface CardItem {
  id: number;
  title: string;
  description: string;
  isDisguised: boolean;
  tapped: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

const DISGUISED_TITLES = [
  "디자인 시스템 실전 가이드",
  "UX 패턴 분석 도구",
  "사용성 테스트 프레임워크",
  "인터랙션 디자인 핸드북",
  "프로토타이핑 워크플로우",
  "컴포넌트 라이브러리 구축",
];

const DISGUISED_DESCRIPTIONS = [
  "전문가가 직접 큐레이션한 자료입니다.",
  "실무에 바로 적용 가능한 인사이트를 확인하세요.",
  "팀 생산성을 높이는 검증된 방법론입니다.",
  "현업 디자이너들이 추천하는 필수 가이드.",
];

export default function DisguisedCtaGridStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  const cards = useMemo(() => {
    // 실제 콘텐츠처럼 보이는 광고 제목 (구분 불가)
    const disguisedTitles = [
      "디자인 시스템 실전 가이드",
      "UX 패턴 분석 도구",
      "사용성 테스트 프레임워크",
      "인터랙션 디자인 핸드북",
      "프로토타이핑 워크플로우",
      "컴포넌트 라이브러리 구축",
    ];

    // 진짜 콘텐츠이지만 광고처럼 보이는 제목 (false positive 유도)
    const realTitles = [
      "무료 디자인 리소스 모음",
      "지금 바로 쓰는 UI 킷",
      "최신 디자인 트렌드 2026",
      "UX 리서치 방법론",
      "프론트엔드 성능 최적화",
      "색상 이론과 실무 적용",
      "타이포그래피 기초",
      "반응형 디자인 전략",
      "모바일 UX 베스트 프랙티스",
    ];

    // 실제 콘텐츠 설명 (광고와 동일한 톤)
    const realDescriptions = [
      "실무에 바로 적용 가능한 인사이트를 확인하세요.",
      "전문가가 직접 큐레이션한 자료입니다.",
      "팀 생산성을 높이는 검증된 방법론입니다.",
      "현업 디자이너들이 추천하는 필수 가이드.",
    ];

    // 광고 설명 (실제 콘텐츠와 동일한 톤)
    const disguisedDescriptions = [
      "전문가가 직접 큐레이션한 자료입니다.",
      "실무에 바로 적용 가능한 인사이트를 확인하세요.",
      "팀 생산성을 높이는 검증된 방법론입니다.",
      "현업 디자이너들이 추천하는 필수 가이드.",
    ];

    const allCards: CardItem[] = [];
    let realCount = 0;
    let disguisedCount = 0;

    for (let i = 0; i < params.gridSize; i++) {
      const shouldBeDisguised =
        disguisedCount < params.disguisedCount &&
        (realCount >= params.gridSize - params.disguisedCount ||
          Math.random() < 0.4);

      if (shouldBeDisguised) {
        const titleIdx = disguisedCount % disguisedTitles.length;
        const descIdx = disguisedCount % disguisedDescriptions.length;
        allCards.push({
          id: i,
          title: disguisedTitles[titleIdx]!,
          description: disguisedDescriptions[descIdx]!,
          isDisguised: true,
          tapped: false,
        });
        disguisedCount++;
      } else {
        const titleIdx = realCount % realTitles.length;
        const descIdx = realCount % realDescriptions.length;
        allCards.push({
          id: i,
          title: realTitles[titleIdx]!,
          description: realDescriptions[descIdx]!,
          isDisguised: false,
          tapped: false,
        });
        realCount++;
      }
    }

    return shuffleArray(allCards);
  }, [params.gridSize, params.disguisedCount]);

  const [cardStates, setCardStates] = useState<CardItem[]>(cards);

  const handleCardTap = useCallback(
    (id: number) => {
      const card = cardStates.find((c) => c.id === id);
      if (!card || card.tapped) return;

      if (card.isDisguised) {
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 1500);
        onFail();
        if (params.wrongCloseAddsLayer) {
          setCardStates((prev) => {
            const realCards = prev.filter((c) => !c.isDisguised);
            if (realCards.length === 0) return prev;
            const newId = prev.length;
            const newCard: CardItem = {
              id: newId,
              title: DISGUISED_TITLES[newId % DISGUISED_TITLES.length]!,
              description: DISGUISED_DESCRIPTIONS[newId % DISGUISED_DESCRIPTIONS.length]!,
              isDisguised: true,
              tapped: false,
            };
            return shuffleArray([...prev, newCard]);
          });
        }
        if (params.shuffleOnMiss) {
          setCardStates((prev) => shuffleArray([...prev]));
        }
      }

      setCardStates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, tapped: true } : c)),
      );

      // Check completion
      const updatedCards = cardStates.map((c) =>
        c.id === id ? { ...c, tapped: true } : c,
      );
      const realCards = updatedCards.filter((c) => !c.isDisguised);
      const allRealTapped =
        realCards.length > 0 && realCards.every((c) => c.tapped);

      if (allRealTapped) {
        setTimeout(onComplete, 300);
      }
    },
    [cardStates, onComplete, onFail, params],
  );

  const realCount = cardStates.filter((c) => !c.isDisguised).length;
  const realTappedCount = cardStates.filter(
    (c) => !c.isDisguised && c.tapped,
  ).length;

  return (
    <div style={containerStyle}>
      {params.showSimBadge && (
        <div style={simBadgeStyle}>시뮬레이션</div>
      )}

      <div style={headerStyle}>
        <h2 style={titleStyle}>추천 콘텐츠</h2>
        <div style={progressStyle}>
          진행도: {realTappedCount} / {realCount}
        </div>
      </div>

      <div
        style={{
          ...gridContainerStyle,
          gridTemplateColumns: `repeat(${Math.min(3, params.gridSize)}, 1fr)`,
        }}
      >
        {cardStates.map((card) => {
          const cardStyle: React.CSSProperties = {
            ...cardBaseStyle,
            border: "1px solid #e5e7eb",
            backgroundColor: card.tapped ? "#e0f2fe" : "#fff",
            opacity: card.tapped ? 0.6 : 1,
            cursor: card.tapped ? "default" : "pointer",
          };

          return (
            <div
              key={card.id}
              style={cardStyle}
              onClick={() => handleCardTap(card.id)}
            >
              {card.isDisguised && <div style={sponsoredBadgeStyle}>광고</div>}
              <h3 style={cardTitleStyle}>{card.title}</h3>
              <p style={cardDescStyle}>{card.description}</p>
              {card.tapped && (
                <div style={checkMarkStyle}>
                  {card.isDisguised ? "❌" : "✓"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showFeedback && (
        <div style={feedbackOverlayStyle}>
          <div style={feedbackBoxStyle}>
            <div style={feedbackIconStyle}>⚠️</div>
            <div style={feedbackTextStyle}>이것은 위장된 광고입니다!</div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  padding: "24px",
  backgroundColor: "#f9fafb",
  overflowY: "auto",
};

const simBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  padding: "6px 12px",
  backgroundColor: "#191F28",
  color: "#fff",
  fontSize: 11,
  fontWeight: 700,
  borderRadius: 6,
  letterSpacing: "0.5px",
  zIndex: 10,
};

const headerStyle: React.CSSProperties = {
  marginBottom: 24,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#191F28",
  margin: 0,
};

const progressStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4E5968",
};

const gridContainerStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(3, 1fr)",
};

const cardBaseStyle: React.CSSProperties = {
  position: "relative",
  padding: "16px",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  transition: "transform 0.2s, opacity 0.2s",
  WebkitTapHighlightColor: "transparent",
};

// "광고" 뱃지: 극도로 작고 낮은 opacity로 거의 안 보임
const sponsoredBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 6,
  right: 6,
  fontSize: 7,
  color: "#e5e7eb",
  backgroundColor: "transparent",
  padding: "1px 3px",
  borderRadius: 2,
  fontWeight: 400,
  opacity: 0.3,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#191F28",
  margin: "0 0 8px 0",
  lineHeight: 1.3,
};

const cardDescStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#4E5968",
  margin: 0,
  lineHeight: 1.5,
};

const checkMarkStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 8,
  right: 8,
  fontSize: 18,
};

const feedbackOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 100,
};

const feedbackBoxStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "24px 32px",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const feedbackIconStyle: React.CSSProperties = {
  fontSize: 48,
  marginBottom: 12,
};

const feedbackTextStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#191F28",
};
