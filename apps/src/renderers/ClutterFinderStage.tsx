import { useState, useCallback, useMemo } from "react";

export interface ClutterFinderParams {
  mode: "clutter_page" | "chaotic_layout";
  targetLabel: string;
  clutterItems: number;
  scrollHeight: number;
  hasSimBadge: boolean;
}

interface ClutterFinderStageProps {
  params: ClutterFinderParams;
  onComplete: () => void;
  onFail: () => void;
}

export default function ClutterFinderStage({
  params,
  onComplete,
  onFail,
}: ClutterFinderStageProps) {
  const [wrongClicks, setWrongClicks] = useState(0);

  const handleWrongClick = useCallback(() => {
    const newCount = wrongClicks + 1;
    setWrongClicks(newCount);
    if (newCount >= 3) {
      onFail();
    }
  }, [wrongClicks, onFail]);

  const handleCorrectClick = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const clutterElements = useMemo(() => {
    const elements: Array<{
      type: string;
      label: string;
      isTarget: boolean;
      top?: string;
      left?: string;
    }> = [];
    const targetIndex = Math.floor(Math.random() * (params.clutterItems + 1));

    for (let i = 0; i <= params.clutterItems; i++) {
      const isTarget = i === targetIndex;
      const elementTypes = ["button", "card", "banner", "alert"];
      const type = elementTypes[Math.floor(Math.random() * elementTypes.length)] ?? "button";

      let label = "";
      if (isTarget) {
        label = params.targetLabel;
      } else {
        const decoyLabels = [
          "추천 상품 보기",
          "이벤트 확인",
          "광고 닫기",
          "더 알아보기",
          "지금 신청",
          "자세히 보기",
          "무료 체험",
          "쿠폰 받기",
          "친구 초대",
          "설정 변경",
        ];
        label = decoyLabels[i % decoyLabels.length] ?? "더 보기";
      }

      const element: {
        type: string;
        label: string;
        isTarget: boolean;
        top?: string;
        left?: string;
      } = { type, label, isTarget };

      if (params.mode === "chaotic_layout") {
        element.top = `${Math.random() * 80 + 10}%`;
        element.left = `${Math.random() * 80 + 5}%`;
      }

      elements.push(element);
    }

    return elements;
  }, [params.clutterItems, params.targetLabel, params.mode]);

  const containerHeight = `${params.scrollHeight * 100}vh`;

  if (params.mode === "chaotic_layout") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          position: "relative",
          backgroundColor: "#F9FAFB",
        }}
      >
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
            SIMULATION
          </div>
        )}

        <div style={{ width: "100%", height: containerHeight, position: "relative" }}>
          {clutterElements.map((element, idx) => {
            const bgColor =
              element.type === "banner"
                ? "#3182F6"
                : element.type === "alert"
                  ? "#E53935"
                  : element.type === "card"
                    ? "#FFFFFF"
                    : "#8B95A1";

            const textColor =
              element.type === "card" ? "#191F28" : "#FFFFFF";

            const fontSize = `${Math.random() * 8 + 12}px`;
            const rotation = `rotate(${Math.random() * 10 - 5}deg)`;

            return (
              <div
                key={idx}
                onClick={element.isTarget ? handleCorrectClick : handleWrongClick}
                style={{
                  position: "absolute",
                  top: element.top,
                  left: element.left,
                  padding: "12px 16px",
                  backgroundColor: bgColor,
                  color: textColor,
                  fontSize,
                  fontWeight: "500",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transform: rotation,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  whiteSpace: "nowrap",
                  zIndex: Math.floor(Math.random() * 100),
                }}
              >
                {element.label}
              </div>
            );
          })}
        </div>
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
      }}
    >
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
          SIMULATION
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
                onClick={handleWrongClick}
                style={{
                  gridColumn: "1 / -1",
                  padding: "20px",
                  backgroundColor: "#3182F6",
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "center",
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
                onClick={handleWrongClick}
                style={{
                  gridColumn: "1 / -1",
                  padding: "16px",
                  backgroundColor: "#FFF9E6",
                  border: "1px solid #FFD700",
                  color: "#191F28",
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
                onClick={handleWrongClick}
                style={{
                  padding: "20px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
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

          // button
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
                backgroundColor: element.isTarget ? "#3182F6" : "#8B95A1",
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
    </div>
  );
}
