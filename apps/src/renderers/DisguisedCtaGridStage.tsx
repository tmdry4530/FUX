import { useState, useCallback, useMemo } from "react";
import type React from "react";

export interface DisguisedCtaGridParams {
  gridSize: number;
  disguisedCount: number;
  showSimBadge: boolean;
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

export default function DisguisedCtaGridStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [missCount, setMissCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const cards = useMemo(() => {
    const realTitles = [
      "최신 디자인 트렌드 2026",
      "UX 리서치 방법론",
      "프론트엔드 성능 최적화",
      "디자인 시스템 구축하기",
      "사용자 인터뷰 가이드",
      "색상 이론과 실무 적용",
      "타이포그래피 기초",
      "반응형 디자인 전략",
      "모바일 UX 베스트 프랙티스",
    ];

    const disguisedTitles = [
      "프리미엄 템플릿 50% 할인",
      "무료 디자인 툴 체험하기",
      "지금 바로 시작하세요",
      "특별 제안: 오늘만 무료",
      "당신을 위한 맞춤 서비스",
      "1분 만에 시작하기",
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
        allCards.push({
          id: i,
          title: disguisedTitles[titleIdx]!,
          description: "지금 클릭하고 혜택을 받아보세요!",
          isDisguised: true,
          tapped: false,
        });
        disguisedCount++;
      } else {
        const titleIdx = realCount % realTitles.length;
        allCards.push({
          id: i,
          title: realTitles[titleIdx]!,
          description: "실무에 바로 적용 가능한 인사이트를 확인하세요.",
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

        const next = missCount + 1;
        setMissCount(next);
        if (next >= 3) {
          onFail();
          return;
        }
      }

      setCardStates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, tapped: true } : c)),
      );

      // Check completion
      const updatedCards = cardStates.map((c) =>
        c.id === id ? { ...c, tapped: true } : c,
      );
      const allRealTapped = updatedCards
        .filter((c) => !c.isDisguised)
        .every((c) => c.tapped);

      if (allRealTapped) {
        setTimeout(onComplete, 300);
      }
    },
    [cardStates, missCount, onComplete, onFail],
  );

  const realCount = cardStates.filter((c) => !c.isDisguised).length;
  const realTappedCount = cardStates.filter(
    (c) => !c.isDisguised && c.tapped,
  ).length;

  return (
    <div style={containerStyle}>
      {params.showSimBadge && (
        <div style={simBadgeStyle}>SIMULATION</div>
      )}

      <div style={headerStyle}>
        <h2 style={titleStyle}>추천 콘텐츠</h2>
        <div style={progressStyle}>
          진행도: {realTappedCount} / {realCount}
        </div>
        <div style={missCounterStyle}>실수: {missCount} / 3</div>
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
            border: card.isDisguised
              ? "1px solid #fde68a"
              : "1px solid #e5e7eb",
            backgroundColor: card.tapped
              ? card.isDisguised
                ? "#fef3c7"
                : "#e0f2fe"
              : "#fff",
            opacity: card.tapped ? 0.6 : 1,
            cursor: card.tapped ? "default" : "pointer",
          };

          return (
            <div
              key={card.id}
              style={cardStyle}
              onClick={() => handleCardTap(card.id)}
            >
              {card.isDisguised && <div style={sponsoredBadgeStyle}>Sponsored</div>}
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

const missCounterStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#E53935",
  fontWeight: 600,
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

const sponsoredBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  fontSize: 9,
  color: "#92400e",
  backgroundColor: "#fef3c7",
  padding: "2px 6px",
  borderRadius: 4,
  fontWeight: 600,
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
