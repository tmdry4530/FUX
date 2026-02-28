import { useCallback, useState, useEffect } from "react";

export interface ClutterFinderParams {
  mode: "clutter_page" | "chaotic_layout";
  targetLabel: string;
  clutterItems: number;
  scrollHeight: number;
  hasSimBadge: boolean;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface ClutterElement {
  type: string;
  label: string;
  isTarget: boolean;
  color: string;
  top?: string;
  left?: string;
  rotation?: string;
  fontSize: string;
  zIndex: number;
}

function buildClutterElements(params: ClutterFinderParams): ClutterElement[] {
  const decoyPool = buildDecoyLabels(params.targetLabel);
  const elements: ClutterElement[] = [];
  const targetIndex = Math.floor(Math.random() * (params.clutterItems + 1));

  for (let i = 0; i <= params.clutterItems; i++) {
    const isTarget = i === targetIndex;
    const elementTypes = ["button", "card", "banner", "alert"];
    const type = elementTypes[Math.floor(Math.random() * elementTypes.length)] ?? "button";
    const label = isTarget ? params.targetLabel : decoyPool[i % decoyPool.length] ?? "더 보기";
    const color = getRandomColor();
    const fontSize = `${Math.random() * 8 + 12}px`;
    const zIndex = Math.floor(Math.random() * 100);
    const element: ClutterElement = { type, label, isTarget, color, fontSize, zIndex };
    if (params.mode === "chaotic_layout") {
      element.top = `${Math.random() * 80 + 10}%`;
      element.left = `${Math.random() * 80 + 5}%`;
      element.rotation = `rotate(${Math.random() * 10 - 5}deg)`;
    }
    elements.push(element);
  }
  return elements;
}

interface ClutterFinderStageProps {
  params: ClutterFinderParams;
  onComplete: () => void;
  onFail: () => void;
}

const BUTTON_COLORS = [
  "#3182F6", "#E53935", "#8B95A1", "#43A047", "#FB8C00",
  "#8E24AA", "#00ACC1", "#6D4C41", "#546E7A", "#F4511E",
  "#039BE5", "#7CB342", "#C0CA33", "#FFB300", "#E91E63",
];

function getRandomColor(exclude?: string): string {
  const filtered = exclude ? BUTTON_COLORS.filter((c) => c !== exclude) : BUTTON_COLORS;
  return filtered[Math.floor(Math.random() * filtered.length)]!;
}

function buildDecoyLabels(targetLabel: string): string[] {
  const similarMap: Record<string, string[]> = {
    "설정 변경": ["설정 확인", "설정 초기화", "설정 보기", "환경 설정", "설정 저장"],
    "동의": ["동의 거부", "미동의", "부분 동의", "조건부 동의", "동의 취소"],
    "확인": ["확인 취소", "재확인", "확인 안 함", "나중에 확인", "확인 필요"],
    "삭제": ["삭제 취소", "임시 삭제", "삭제 보류", "삭제 예약", "삭제 확인"],
    "저장": ["저장 안 함", "임시 저장", "저장 취소", "자동 저장", "저장 보류"],
  };

  const specific = similarMap[targetLabel];
  if (specific) return specific;

  return [
    `${targetLabel} 취소`,
    `${targetLabel} 확인`,
    `${targetLabel} 안 함`,
    "추천 상품 보기",
    "이벤트 확인",
    "광고 닫기",
    "더 알아보기",
    "지금 신청",
    "자세히 보기",
    "무료 체험",
    "쿠폰 받기",
    "친구 초대",
  ];
}

export default function ClutterFinderStage({
  params,
  onComplete,
  onFail,
}: ClutterFinderStageProps) {
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [showFakeNotif, setShowFakeNotif] = useState(false);
  const [fakeNotifTimer, setFakeNotifTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkVisible((v) => !v);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const delay = 5000 + Math.random() * 2000;
    const timer = setTimeout(() => {
      setShowFakeNotif(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [fakeNotifTimer]);

  const handleWrongClick = useCallback(() => {
    if (params.wrongCloseAddsLayer) {
      setClutterElements((prev) => {
        if (prev.length >= params.clutterItems + 10) return prev;
        const decoyPool = buildDecoyLabels(params.targetLabel);
        const newDecoys: ClutterElement[] = Array.from({ length: 2 }, (_, i) => {
          const element: ClutterElement = {
            type: "button",
            label: decoyPool[(prev.length + i) % decoyPool.length] ?? "더 보기",
            isTarget: false,
            color: getRandomColor(),
            fontSize: `${Math.random() * 8 + 12}px`,
            zIndex: Math.floor(Math.random() * 100),
          };
          if (params.mode === "chaotic_layout") {
            element.top = `${Math.random() * 80 + 10}%`;
            element.left = `${Math.random() * 80 + 5}%`;
            element.rotation = `rotate(${Math.random() * 10 - 5}deg)`;
          }
          return element;
        });
        return [...prev, ...newDecoys];
      });
    }
    if (params.shuffleOnMiss) {
      setClutterElements((prev) => {
        if (params.mode === "chaotic_layout") {
          return prev.map((el) => ({
            ...el,
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 5}%`,
            rotation: `rotate(${Math.random() * 10 - 5}deg)`,
          }));
        }
        const copy = [...prev];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j]!, copy[i]!];
        }
        return copy;
      });
    }
    onFail();
  }, [onFail, params]);

  const handleCorrectClick = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleFakeNotifClick = useCallback(() => {
    setShowFakeNotif(false);
    onFail();
    setFakeNotifTimer((n) => n + 1);
  }, [onFail]);

  const handleFakeNotifClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFakeNotif(false);
    setFakeNotifTimer((n) => n + 1);
  }, []);

  const [clutterElements, setClutterElements] = useState<ClutterElement[]>(() =>
    buildClutterElements(params),
  );

  const containerHeight = `${params.scrollHeight}px`;

  const targetHeader = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "12px 16px",
        background: "linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        zIndex: 1001,
      }}
    >
      <span style={{
        fontSize: 11,
        fontWeight: 800,
        color: "rgba(255,255,255,0.8)",
        background: "rgba(255,255,255,0.2)",
        padding: "2px 8px",
        borderRadius: 4,
        flexShrink: 0,
        letterSpacing: "0.5px",
      }}>미션</span>
      <span style={{
        fontSize: 15,
        fontWeight: 700,
        color: "#fff",
      }}>"{params.targetLabel}" 버튼 찾기</span>
    </div>
  );

  const fakeNotifPopup = showFakeNotif && (
    <div
      onClick={handleFakeNotifClick}
      style={{
        position: "fixed",
        bottom: "80px",
        right: "16px",
        width: "260px",
        padding: "14px 16px",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        zIndex: 2000,
        cursor: "pointer",
        border: "1px solid #E5E7EB",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#191F28", marginBottom: "4px" }}>
            새 알림 도착
          </div>
          <div style={{ fontSize: "12px", color: "#4E5968" }}>
            지금 확인하고 혜택을 받아보세요!
          </div>
        </div>
        <span
          onClick={handleFakeNotifClose}
          style={{
            fontSize: "18px",
            color: "#8B95A1",
            lineHeight: 1,
            padding: "0 4px",
            cursor: "pointer",
          }}
        >
          ×
        </span>
      </div>
    </div>
  );

  if (params.mode === "chaotic_layout") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          position: "relative",
          backgroundColor: "#F9FAFB",
          paddingTop: "44px",
        }}
      >
        {targetHeader}
        {params.hasSimBadge && (
          <div
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              padding: "6px 12px",
              backgroundColor: "#FFD700",
              color: "#191F28",
              fontSize: "12px",
              fontWeight: "600",
              borderRadius: "4px",
              zIndex: 1000,
            }}
          >
            시뮬레이션
          </div>
        )}

        <div style={{ width: "100%", height: containerHeight, position: "relative" }}>
          {clutterElements.map((element, idx) => {
            const rotation = element.rotation ?? "rotate(0deg)";
            const textColor = "#FFFFFF";

            return (
              <div
                key={idx}
                onClick={element.isTarget ? handleCorrectClick : handleWrongClick}
                style={{
                  position: "absolute",
                  top: element.top,
                  left: element.left,
                  padding: "12px 16px",
                  backgroundColor: element.color,
                  color: textColor,
                  fontSize: element.fontSize,
                  fontWeight: "500",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transform: rotation,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  whiteSpace: "nowrap",
                  zIndex: element.zIndex,
                }}
              >
                {element.label}
              </div>
            );
          })}
        </div>
        {fakeNotifPopup}
      </div>
    );
  }

  // clutter_page mode
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        backgroundColor: "#F9FAFB",
        paddingTop: "44px",
      }}
    >
      {targetHeader}
      {params.hasSimBadge && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            padding: "6px 12px",
            backgroundColor: "#FFD700",
            color: "#191F28",
            fontSize: "12px",
            fontWeight: "600",
            borderRadius: "4px",
            zIndex: 1000,
          }}
        >
          시뮬레이션
        </div>
      )}

      <div
        style={{
          minHeight: containerHeight,
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {clutterElements.map((element, idx) => {
          if (element.type === "banner") {
            return (
              <div
                key={idx}
                onClick={element.isTarget ? handleCorrectClick : handleWrongClick}
                style={{
                  gridColumn: "1 / -1",
                  padding: "20px",
                  backgroundColor: element.color,
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "center",
                  animation: blinkVisible ? undefined : "none",
                  opacity: blinkVisible ? 1 : 0.4,
                  transition: "opacity 0.3s",
                }}
              >
                {element.label}
              </div>
            );
          }

          if (element.type === "alert") {
            return (
              <div
                key={idx}
                onClick={element.isTarget ? handleCorrectClick : handleWrongClick}
                style={{
                  gridColumn: "1 / -1",
                  padding: "16px",
                  backgroundColor: element.color,
                  border: `1px solid ${element.color}`,
                  color: "#FFFFFF",
                  fontSize: "14px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ⚠️ {element.label}
              </div>
            );
          }

          if (element.type === "card") {
            return (
              <div
                key={idx}
                onClick={element.isTarget ? handleCorrectClick : handleWrongClick}
                style={{
                  padding: "20px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  borderTop: `3px solid ${element.color}`,
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#191F28",
                    marginBottom: "8px",
                  }}
                >
                  {element.label}
                </div>
                <div style={{ fontSize: "12px", color: "#8B95A1" }}>
                  추가 정보를 확인하세요
                </div>
              </div>
            );
          }

          // button — all same style, just different color
          return (
            <button
              key={idx}
              type="button"
              onClick={element.isTarget ? handleCorrectClick : handleWrongClick}
              style={{
                padding: "16px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#FFFFFF",
                backgroundColor: element.color,
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {element.label}
            </button>
          );
        })}
      </div>
      {fakeNotifPopup}
    </div>
  );
}
