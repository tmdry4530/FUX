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
  category: string;
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
  "이 운동화 하나로 무릎 통증이 사라졌어요",
  "직장인 점심 해결! 5분 완성 도시락",
  "2026 가성비 노트북 TOP 5 (놀라운 순위)",
  "피부 나이 10살 되돌리는 세럼 솔직 후기",
  "월세 아끼는 꿀팁 3가지 (아무도 안 알려줌)",
  "혼자 여행하기 좋은 국내 숙소 BEST",
  "다이어트 식단, 이것만 바꿨더니 -5kg",
  "요즘 MZ세대가 열광하는 카페 리스트",
  "이 앱 하나로 영어 회화 마스터했어요",
  "30대 재테크, 이 방법이면 월 100만원 추가 수익",
];

const DISGUISED_DESCRIPTIONS = [
  "지금 가입하면 첫 달 무료! 한정 혜택",
  "이 링크로 구매 시 50% 할인 적용",
  "전문가가 직접 추천하는 인기 상품입니다",
  "한정 수량 특별가 — 오늘만 이 가격",
  "10만 명이 선택한 검증된 솔루션",
];

const DISGUISED_CATEGORIES = ["후기", "추천", "꿀팁", "인기", "트렌드"];
const REAL_CATEGORIES = ["일상", "뉴스", "요리", "운동", "여행", "꿀팁", "음악", "반려동물"];

export default function DisguisedCtaGridStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  const cards = useMemo(() => {
    // 위장 광고 — 진짜 콘텐츠처럼 보이지만 실은 광고
    const disguisedTitles = [
      "이 운동화 하나로 무릎 통증이 사라졌어요",
      "직장인 점심 해결! 5분 완성 도시락",
      "2026 가성비 노트북 TOP 5 (놀라운 순위)",
      "피부 나이 10살 되돌리는 세럼 솔직 후기",
      "월세 아끼는 꿀팁 3가지 (아무도 안 알려줌)",
      "혼자 여행하기 좋은 국내 숙소 BEST",
      "다이어트 식단, 이것만 바꿨더니 -5kg",
      "요즘 MZ세대가 열광하는 카페 리스트",
      "이 앱 하나로 영어 회화 마스터했어요",
      "30대 재테크, 이 방법이면 월 100만원 추가 수익",
    ];

    // 진짜 콘텐츠 — 일상적인 포스트/뉴스
    const realTitles = [
      "오늘 서울 미세먼지 '나쁨' 예보",
      "지하철 2호선 강남역 15분 지연",
      "이번 주 박스오피스 1위 영화는?",
      "봄맞이 옷장 정리하는 법",
      "집에서 만드는 간단 크림 파스타",
      "퇴근 후 30분 홈트 루틴",
      "이번 달 전기요금 절약 팁",
      "주말 나들이 추천 공원 5곳",
      "초보 자취생 흔한 요리 실수 모음",
      "비 오는 날 들으면 좋은 노래 플리",
      "강아지 산책 시 주의할 점 3가지",
      "냉장고 남은 재료로 만드는 볶음밥",
    ];

    // 진짜 콘텐츠 설명 — 진솔한 개인 톤
    const realDescriptions = [
      "어제 직접 해봤는데 진짜 맛있었어요.",
      "출퇴근길에 참고하세요.",
      "주변 지인들한테 공유했더니 반응 좋았어요.",
      "생각보다 쉬워서 바로 따라 해봤습니다.",
      "알아두면 은근 유용한 정보!",
    ];

    // 위장 광고 설명 — 진짜 후기처럼 보이지만 프로모션
    const disguisedDescriptions = [
      "써보고 인생템 등극... 링크 남겨둘게요.",
      "솔직 후기인데 이건 진짜 추천합니다.",
      "주변에서 다 쓰길래 나도 써봤는데 대박.",
      "광고 아니고 진심으로 추천하는 거예요.",
      "이건 두 번 말하면 입 아플 정도로 좋아요.",
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
        const catIdx = disguisedCount % DISGUISED_CATEGORIES.length;
        allCards.push({
          id: i,
          title: disguisedTitles[titleIdx]!,
          description: disguisedDescriptions[descIdx]!,
          isDisguised: true,
          tapped: false,
          category: DISGUISED_CATEGORIES[catIdx]!,
        });
        disguisedCount++;
      } else {
        const titleIdx = realCount % realTitles.length;
        const descIdx = realCount % realDescriptions.length;
        const catIdx = realCount % REAL_CATEGORIES.length;
        allCards.push({
          id: i,
          title: realTitles[titleIdx]!,
          description: realDescriptions[descIdx]!,
          isDisguised: false,
          tapped: false,
          category: REAL_CATEGORIES[catIdx]!,
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
            const currentDisguised = prev.filter((c) => c.isDisguised).length;
            if (currentDisguised >= params.disguisedCount * 2) return prev;
            const realCards = prev.filter((c) => !c.isDisguised);
            if (realCards.length === 0) return prev;
            const newId = prev.length;
            const newCard: CardItem = {
              id: newId,
              title: DISGUISED_TITLES[newId % DISGUISED_TITLES.length]!,
              description: DISGUISED_DESCRIPTIONS[newId % DISGUISED_DESCRIPTIONS.length]!,
              isDisguised: true,
              tapped: false,
              category: DISGUISED_CATEGORIES[newId % DISGUISED_CATEGORIES.length]!,
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
        <h2 style={titleStyle}>오늘의 피드</h2>
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
              {card.isDisguised && <div style={sponsoredBadgeStyle}>Sponsored</div>}
              <div style={categoryTagStyle}>{card.category}</div>
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
            <div style={feedbackTextStyle}>네이티브 광고에 속았습니다!</div>
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
  fontSize: 8,
  color: "#e5e7eb",
  backgroundColor: "transparent",
  padding: "1px 3px",
  borderRadius: 2,
  fontWeight: 400,
  opacity: 0.4,
};

const categoryTagStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 10,
  fontWeight: 600,
  color: '#3182F6',
  backgroundColor: '#E8F3FF',
  padding: '2px 6px',
  borderRadius: 4,
  marginBottom: 6,
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
