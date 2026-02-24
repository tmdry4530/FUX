import { useState, useCallback } from "react";
import type React from "react";

export interface ConsentToggleLabourParams {
  toggleCount: number;
  hasRejectAll: false;
}

interface StageRendererProps {
  params: ConsentToggleLabourParams;
  onComplete: () => void;
  onFail: () => void;
}

interface ToggleItem {
  id: string;
  label: string;
  isEssential: boolean;
  enabled: boolean;
}

export default function ConsentToggleLabourStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [toggles, setToggles] = useState<ToggleItem[]>(() => {
    const defaultLabels = [
      { label: "필수", isEssential: true },
      { label: "분석", isEssential: false },
      { label: "마케팅", isEssential: false },
      { label: "소셜 미디어", isEssential: false },
      { label: "개인화", isEssential: false },
      { label: "성능", isEssential: false },
      { label: "제3자", isEssential: false },
      { label: "리타게팅", isEssential: false },
      { label: "위치", isEssential: false },
      { label: "기기 정보", isEssential: false },
      { label: "행동 분석", isEssential: false },
      { label: "사이트 간 추적", isEssential: false },
    ];

    return defaultLabels.slice(0, params.toggleCount).map((item, idx) => ({
      id: `toggle-${idx}`,
      label: item.label,
      isEssential: item.isEssential,
      enabled: true, // All ON by default
    }));
  });

  const handleToggle = useCallback((id: string) => {
    setToggles((prev) =>
      prev.map((t) =>
        t.id === id && !t.isEssential ? { ...t, enabled: !t.enabled } : t,
      ),
    );
  }, []);

  const handleAcceptAll = useCallback(() => {
    onFail();
  }, [onFail]);

  const handleSave = useCallback(() => {
    const allNonEssentialOff = toggles
      .filter((t) => !t.isEssential)
      .every((t) => !t.enabled);

    if (allNonEssentialOff) {
      onComplete();
    }
  }, [toggles, onComplete]);

  const nonEssentialOffCount = toggles.filter(
    (t) => !t.isEssential && !t.enabled,
  ).length;
  const totalNonEssential = toggles.filter((t) => !t.isEssential).length;

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2 style={titleStyle}>개인정보 설정 관리</h2>
        <p style={descStyle}>
          서비스 개선을 위해 쿠키 및 유사 기술을 사용합니다. 아래에서 각 항목을
          관리하실 수 있습니다.
        </p>

        <div style={progressIndicatorStyle}>
          설정 완료: {nonEssentialOffCount} / {totalNonEssential} 항목 거부됨
        </div>

        <div style={toggleListStyle}>
          {toggles.map((toggle) => (
            <div key={toggle.id} style={toggleRowStyle}>
              <div style={toggleLabelContainerStyle}>
                <span style={toggleLabelStyle}>
                  {toggle.label}
                  {toggle.isEssential && (
                    <span style={essentialBadgeStyle}>(필수)</span>
                  )}
                </span>
              </div>
              <button
                type="button"
                disabled={toggle.isEssential}
                onClick={() => handleToggle(toggle.id)}
                style={{
                  ...toggleButtonStyle,
                  backgroundColor: toggle.enabled ? "#3182F6" : "#d1d5db",
                  opacity: toggle.isEssential ? 0.5 : 1,
                  cursor: toggle.isEssential ? "not-allowed" : "pointer",
                }}
              >
                <div
                  style={{
                    ...toggleKnobStyle,
                    transform: toggle.enabled
                      ? "translateX(20px)"
                      : "translateX(2px)",
                  }}
                />
              </button>
            </div>
          ))}
        </div>

        <div style={buttonContainerStyle}>
          <button type="button" style={acceptAllButtonStyle} onClick={handleAcceptAll}>
            모두 허용
          </button>
          <button type="button" style={saveButtonStyle} onClick={handleSave}>
            설정 저장
          </button>
        </div>

        <p style={hintTextStyle}>
          모든 선택 항목을 거부하려면 각 토글을 수동으로 꺼야 합니다.
        </p>
      </div>
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f3f4f6",
  padding: "24px",
  overflowY: "auto",
};

const panelStyle: React.CSSProperties = {
  maxWidth: 480,
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: "24px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 12px 0",
};

const descStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#4E5968",
  margin: "0 0 16px 0",
};

const progressIndicatorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#8B95A1",
  padding: "8px 12px",
  backgroundColor: "#f9fafb",
  borderRadius: 8,
  marginBottom: 16,
  textAlign: "center",
};

const toggleListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginBottom: 24,
  maxHeight: 320,
  overflowY: "auto",
  padding: "4px",
};

const toggleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px",
  backgroundColor: "#f9fafb",
  borderRadius: 8,
};

const toggleLabelContainerStyle: React.CSSProperties = {
  flex: 1,
};

const toggleLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#191F28",
};

const essentialBadgeStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#8B95A1",
  marginLeft: 6,
  fontWeight: 400,
};

const toggleButtonStyle: React.CSSProperties = {
  position: "relative",
  width: 44,
  height: 24,
  borderRadius: 12,
  border: "none",
  transition: "background-color 0.2s",
  WebkitTapHighlightColor: "transparent",
  flexShrink: 0,
};

const toggleKnobStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  backgroundColor: "#fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  transition: "transform 0.2s",
};

const buttonContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginBottom: 16,
};

const acceptAllButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px 24px",
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "#3182F6",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};

const saveButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px 24px",
  fontSize: 15,
  fontWeight: 600,
  color: "#191F28",
  backgroundColor: "#e5e7eb",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};

const hintTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#8B95A1",
  margin: 0,
  textAlign: "center",
  fontStyle: "italic",
};
