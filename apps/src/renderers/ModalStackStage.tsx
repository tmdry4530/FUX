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
  fakeCloseTraps?: boolean;
  dontShowAgainTrap?: boolean;
  misleadingTitles?: boolean;
  shuffleOnMiss?: boolean;
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
  hasDontShowAgain?: boolean;
  dontShowAgainChecked?: boolean;
}

export default function ModalStackStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const nextIdRef = useRef(1);
  const initialLayersRef = useRef(params.layers);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [xOnLeft, setXOnLeft] = useState(false);
  const [fakeCloseSwapped, setFakeCloseSwapped] = useState(false);

  const createLayer = useCallback((title: string, hasDontShowAgain?: boolean): ModalLayer => {
    return { id: nextIdRef.current++, title, scrollEnabled: false, hasDontShowAgain, dontShowAgainChecked: false };
  }, []);

  const misleadingTitleList = [
    "마지막 모달입니다!",
    "모두 닫기",
    "완료",
    "알림 (1/1)",
    "거의 다 왔어요!",
    "최종 확인",
  ];

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
  const titles = params.misleadingTitles
    ? misleadingTitleList
    : (params.modalTitles ?? defaultTitles);
  const bodyText =
    params.modalBodyText ??
    "본 서비스 이용약관에 동의하시겠습니까? 이 약관은 사용자의 개인정보 처리 방침과 관련된 내용을 포함하고 있으며, 서비스 이용 시 반드시 숙지하셔야 합니다. 약관의 세부 내용은 아래를 스크롤하여 확인해 주세요.";

  const [layers, setLayers] = useState<ModalLayer[]>(() => {
    const initial: ModalLayer[] = [];
    for (let i = 0; i < params.layers; i++) {
      const hasDontShowAgain = params.dontShowAgainTrap && i % 2 === 0;
      initial.push(createLayer(titles[i % titles.length]!, hasDontShowAgain));
    }
    return initial;
  });

  const addNewLayer = useCallback(() => {
    const cap = initialLayersRef.current + 5;
    const newTitle = titles[(layers.length) % titles.length]!;
    const hasDontShowAgain = params.dontShowAgainTrap && Math.random() > 0.5;
    setLayers((prev) => {
      if (prev.length >= cap) return prev;
      return [...prev, createLayer(newTitle, hasDontShowAgain)];
    });
  }, [layers.length, titles, params.dontShowAgainTrap, createLayer]);

  const triggerShuffle = useCallback(() => {
    if (!params.shuffleOnMiss) return;
    setXOnLeft((prev) => !prev);
    if (params.fakeCloseTraps) {
      setFakeCloseSwapped((prev) => !prev);
    }
  }, [params.shuffleOnMiss, params.fakeCloseTraps]);

  const handleCloseAttempt = useCallback(
    (layerId: number) => {
      const topLayer = layers[layers.length - 1];
      if (!topLayer) return;

      // Enforce closeOrder
      if (params.closeOrder === "topFirst" && layerId !== topLayer.id) {
        if (params.wrongCloseAddsLayer) {
          const newTitle = titles[(layers.length) % titles.length]!;
          const cap = initialLayersRef.current + 5;
          setLayers((prev) => prev.length >= cap ? prev : [...prev, createLayer(newTitle)]);
        }
        triggerShuffle();
        onFail();
        return;
      }

      // Enforce scroll requirement
      const target = layers.find((l) => l.id === layerId);
      if (params.requiresScrollToEnableClose && target && !target.scrollEnabled) {
        if (params.wrongCloseAddsLayer) {
          const newTitle = titles[(layers.length) % titles.length]!;
          const cap = initialLayersRef.current + 5;
          setLayers((prev) => prev.length >= cap ? prev : [...prev, createLayer(newTitle)]);
        }
        triggerShuffle();
        return;
      }

      // Check dontShowAgain trap
      if (target?.hasDontShowAgain && target.dontShowAgainChecked) {
        // Show confirm modal - this is a trap
        setConfirmTargetId(layerId);
        setConfirmModal(true);
        return;
      }

      // Close the layer
      setLayers((prev) => {
        const next = prev.filter((l) => l.id !== layerId);
        if (next.length === 0) {
          setTimeout(onComplete, 0);
        }
        return next;
      });
    },
    [layers, params, titles, onComplete, onFail, createLayer, triggerShuffle],
  );

  // "저장" in confirm modal = trap (adds layer)
  const handleConfirmSave = useCallback(() => {
    setConfirmModal(false);
    setConfirmTargetId(null);
    addNewLayer();
    triggerShuffle();
    onFail();
  }, [addNewLayer, triggerShuffle, onFail]);

  // "취소" in confirm modal = correct (close the layer)
  const handleConfirmCancel = useCallback(() => {
    setConfirmModal(false);
    const id = confirmTargetId;
    setConfirmTargetId(null);
    if (id === null) return;
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (next.length === 0) {
        setTimeout(onComplete, 0);
      }
      return next;
    });
  }, [confirmTargetId, onComplete]);

  // Wrong close button (fake) = trap
  const handleFakeClose = useCallback(
    (_layerId: number) => {
      if (params.wrongCloseAddsLayer) {
        const newTitle = titles[(layers.length) % titles.length]!;
        const cap = initialLayersRef.current + 5;
        setLayers((prev) => prev.length >= cap ? prev : [...prev, createLayer(newTitle)]);
      }
      triggerShuffle();
      onFail();
    },
    [layers.length, titles, params.wrongCloseAddsLayer, onFail, createLayer, triggerShuffle],
  );

  const handleDontShowAgainChange = useCallback((layerId: number, checked: boolean) => {
    setLayers((prev) =>
      prev.map((l) => l.id === layerId ? { ...l, dontShowAgainChecked: checked } : l),
    );
  }, []);

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
        const isEnabled =
          isTop ||
          params.closeOrder === "any";
        const closeDisabled =
          params.requiresScrollToEnableClose && !layer.scrollEnabled;

        const headerButtons = (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* fakeCloseTraps: show both X and text close, only one works */}
            {params.fakeCloseTraps ? (
              <>
                {params.closeControl === "x" ? (
                  // Real X + fake text button (swapped when fakeCloseSwapped)
                  <>
                    <button
                      type="button"
                      style={{
                        ...closeXStyle,
                        color: closeDisabled ? "#ccc" : "#333",
                      }}
                      onClick={() =>
                        fakeCloseSwapped
                          ? handleFakeClose(layer.id)
                          : handleCloseAttempt(layer.id)
                      }
                    >
                      ✕
                    </button>
                    <button
                      type="button"
                      style={fakeTextCloseStyle}
                      onClick={() =>
                        fakeCloseSwapped
                          ? handleCloseAttempt(layer.id)
                          : handleFakeClose(layer.id)
                      }
                    >
                      닫기
                    </button>
                  </>
                ) : (
                  // Real button in footer, fake X here (swapped when fakeCloseSwapped)
                  <button
                    type="button"
                    style={{
                      ...closeXStyle,
                      color: closeDisabled ? "#ccc" : "#333",
                    }}
                    onClick={() =>
                      fakeCloseSwapped
                        ? handleCloseAttempt(layer.id)
                        : handleFakeClose(layer.id)
                    }
                  >
                    ✕
                  </button>
                )}
              </>
            ) : (
              params.closeControl === "x" && (
                <button
                  type="button"
                  style={{
                    ...closeXStyle,
                    color: closeDisabled ? "#ccc" : "#333",
                  }}
                  onClick={() => handleCloseAttempt(layer.id)}
                >
                  ✕
                </button>
              )
            )}
          </div>
        );

        return (
          <div
            key={layer.id}
            style={{
              ...overlayStyle,
              zIndex: 100 + index,
              backgroundColor: `rgba(0,0,0,${0.2 + index * 0.05})`,
              cursor: "default",
            }}
          >
            <div
              style={{
                ...modalStyle,
                transform: `translateY(${offset}px)`,
                opacity: isTop ? 1 : 0.7,
                pointerEvents: isEnabled ? "auto" : "none",
              }}
            >
              <div style={headerStyle}>
                {xOnLeft ? (
                  <>
                    {headerButtons}
                    <span style={titleStyle}>{layer.title}</span>
                  </>
                ) : (
                  <>
                    <span style={titleStyle}>{layer.title}</span>
                    {headerButtons}
                  </>
                )}
              </div>

              <div
                style={bodyStyle}
                onScroll={(e) => handleScroll(layer.id, e)}
              >
                <p style={bodyTextStyle}>
                  {bodyText}
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

              {layer.hasDontShowAgain && (
                <div style={checkboxRowStyle}>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={layer.dontShowAgainChecked}
                      onChange={(e) => handleDontShowAgainChange(layer.id, e.target.checked)}
                      style={{ marginRight: 6 }}
                    />
                    다시 보지 않기
                  </label>
                </div>
              )}

              {(params.closeControl === "button" || params.fakeCloseTraps) && (
                <div style={footerStyle}>
                  <button
                    type="button"
                    style={{
                      ...closeButtonStyle,
                      backgroundColor:
                        closeDisabled ? "#ddd" : "#1b64da",
                      color: closeDisabled ? "#999" : "#fff",
                    }}
                    onClick={() =>
                      params.fakeCloseTraps && params.closeControl === "button" && fakeCloseSwapped
                        ? handleFakeClose(layer.id)
                        : handleCloseAttempt(layer.id)
                    }
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Confirm modal for dontShowAgain trap */}
      {confirmModal && (
        <div style={{ ...overlayStyle, zIndex: 999, backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div style={{ ...modalStyle, opacity: 1, pointerEvents: "auto" }}>
            <div style={headerStyle}>
              <span style={titleStyle}>설정 저장</span>
            </div>
            <div style={bodyStyle}>
              <p style={bodyTextStyle}>설정을 저장하시겠습니까?</p>
            </div>
            <div style={{ ...footerStyle, gap: 8 }}>
              <button
                type="button"
                style={{ ...closeButtonStyle, backgroundColor: "#1b64da", color: "#fff", flex: 1 }}
                onClick={handleConfirmSave}
              >
                설정 적용
              </button>
              <button
                type="button"
                style={{ ...closeButtonStyle, backgroundColor: "#f2f4f6", color: "#333", flex: 1 }}
                onClick={handleConfirmCancel}
              >
                취소
              </button>
            </div>
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

const fakeTextCloseStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid #e5e8eb",
  borderRadius: 4,
  fontSize: 12,
  color: "#4e5968",
  cursor: "pointer",
  padding: "2px 8px",
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

const checkboxRowStyle: React.CSSProperties = {
  padding: "0 16px 12px",
};

const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: 13,
  color: "#4e5968",
  cursor: "pointer",
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
