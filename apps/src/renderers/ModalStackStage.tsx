import { useState, useCallback, useRef } from "react";
import type React from "react";

export interface ModalStackParams {
  layers: number;
  closeControl: "x" | "button";
  closeOrder: "topFirst" | "any";
  wrongCloseAddsLayer: boolean;
  requiresScrollToEnableClose: boolean;
  modalTitles?: string[];
  modalBodyText?: string;
}

interface StageRendererProps {
  params: ModalStackParams;
  onComplete: () => void;
  onFail: () => void;
}

interface ModalLayer {
  id: number;
  title: string;
  scrollEnabled: boolean;
}

export default function ModalStackStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const nextIdRef = useRef(1);
  const createLayer = useCallback((title: string): ModalLayer => {
    return { id: nextIdRef.current++, title, scrollEnabled: false };
  }, []);

  const defaultTitles = [
    "알림",
    "확인",
    "동의 필요",
    "공지사항",
    "업데이트",
    "정보",
    "안내",
    "주의",
  ];
  const titles = params.modalTitles ?? defaultTitles;
  const bodyText =
    params.modalBodyText ??
    "본 서비스 이용약관에 동의하시겠습니까? 이 약관은 사용자의 개인정보 처리 방침과 관련된 내용을 포함하고 있으며, 서비스 이용 시 반드시 숙지하셔야 합니다. 약관의 세부 내용은 아래를 스크롤하여 확인해 주세요.";

  const [layers, setLayers] = useState<ModalLayer[]>(() => {
    const initial: ModalLayer[] = [];
    for (let i = 0; i < params.layers; i++) {
      initial.push(createLayer(titles[i % titles.length]!));
    }
    return initial;
  });

  const [wrongAttempts, setWrongAttempts] = useState(0);

  const handleCloseAttempt = useCallback(
    (layerId: number) => {
      const topLayer = layers[layers.length - 1];
      if (!topLayer) return;

      // Enforce closeOrder
      if (params.closeOrder === "topFirst" && layerId !== topLayer.id) {
        if (params.wrongCloseAddsLayer) {
          const newTitle = titles[(layers.length) % titles.length]!;
          setLayers((prev) => [...prev, createLayer(newTitle)]);
        }
        const next = wrongAttempts + 1;
        setWrongAttempts(next);
        if (next >= 5) {
          onFail();
        }
        return;
      }

      // Enforce scroll requirement
      const target = layers.find((l) => l.id === layerId);
      if (params.requiresScrollToEnableClose && target && !target.scrollEnabled) {
        // Close button not yet enabled - punish
        if (params.wrongCloseAddsLayer) {
          const newTitle = titles[(layers.length) % titles.length]!;
          setLayers((prev) => [...prev, createLayer(newTitle)]);
        }
        return;
      }

      // Close the layer
      setLayers((prev) => {
        const next = prev.filter((l) => l.id !== layerId);
        if (next.length === 0) {
          // All modals closed - defer to avoid setState during render
          setTimeout(onComplete, 0);
        }
        return next;
      });
    },
    [layers, params, titles, wrongAttempts, onComplete, onFail],
  );

  const handleScroll = useCallback(
    (layerId: number, e: React.UIEvent<HTMLDivElement>) => {
      if (!params.requiresScrollToEnableClose) return;
      const el = e.currentTarget;
      const scrolledToBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 10;
      if (scrolledToBottom) {
        setLayers((prev) =>
          prev.map((l) =>
            l.id === layerId ? { ...l, scrollEnabled: true } : l,
          ),
        );
      }
    },
    [params.requiresScrollToEnableClose],
  );

  if (layers.length === 0) return null;

  return (
    <div style={containerStyle}>
      {layers.map((layer, index) => {
        const offset = index * 8;
        const isTop = index === layers.length - 1;

        return (
          <div
            key={layer.id}
            style={{
              ...overlayStyle,
              zIndex: 100 + index,
              backgroundColor: `rgba(0,0,0,${0.2 + index * 0.05})`,
            }}
          >
            <div
              style={{
                ...modalStyle,
                transform: `translateY(${offset}px)`,
                opacity: isTop ? 1 : 0.7,
                pointerEvents: isTop || params.closeOrder === "any" ? "auto" : "none",
              }}
            >
              <div style={headerStyle}>
                <span style={titleStyle}>{layer.title}</span>
                {params.closeControl === "x" && (
                  <button
                    type="button"
                    style={{
                      ...closeXStyle,
                      color:
                        params.requiresScrollToEnableClose && !layer.scrollEnabled
                          ? "#ccc"
                          : "#333",
                    }}
                    onClick={() => handleCloseAttempt(layer.id)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div
                style={bodyStyle}
                onScroll={(e) => handleScroll(layer.id, e)}
              >
                <p style={bodyTextStyle}>
                  {bodyText}
                  {/* Repeat text to make scrollable */}
                  {params.requiresScrollToEnableClose && (
                    <>
                      <br /><br />
                      {bodyText}
                      <br /><br />
                      {bodyText}
                    </>
                  )}
                </p>
              </div>

              {params.closeControl === "button" && (
                <div style={footerStyle}>
                  <button
                    type="button"
                    style={{
                      ...closeButtonStyle,
                      backgroundColor:
                        params.requiresScrollToEnableClose && !layer.scrollEnabled
                          ? "#ddd"
                          : "#1b64da",
                      color:
                        params.requiresScrollToEnableClose && !layer.scrollEnabled
                          ? "#999"
                          : "#fff",
                    }}
                    onClick={() => handleCloseAttempt(layer.id)}
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: 400,
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle: React.CSSProperties = {
  width: 280,
  maxHeight: 360,
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 16px 8px",
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#191f28",
};

const closeXStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  padding: "4px 8px",
  lineHeight: 1,
  WebkitTapHighlightColor: "transparent",
};

const bodyStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "0 16px 16px",
  maxHeight: 240,
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#4e5968",
  margin: 0,
};

const footerStyle: React.CSSProperties = {
  padding: "8px 16px 16px",
  display: "flex",
  justifyContent: "stretch",
};

const closeButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px 0",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};
