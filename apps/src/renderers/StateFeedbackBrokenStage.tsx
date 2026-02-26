import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";

export interface StateFeedbackBrokenParams {
  fields: string[];
  requireStatusCheck: boolean;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface StageRendererProps {
  params: StateFeedbackBrokenParams;
  onComplete: () => void;
  onFail: () => void;
}

export default function StateFeedbackBrokenStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [allFields, setAllFields] = useState<string[]>(() => [...params.fields]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showResubmit, setShowResubmit] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Fake toast: appears after first submit, fades out after 1.5s, then shows resubmit trap
  useEffect(() => {
    if (!showToast) return;
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => {
        setShowToast(false);
        setShowResubmit(true);
      }, 400);
    }, 1500);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [showToast]);

  const handleSubmit = useCallback(() => {
    const allFilled = allFields.every((field) => {
      const value = formData[field];
      return value !== undefined && value.trim() !== "";
    });

    if (!allFilled) return;

    if (!isSubmitted) {
      // Real first submission - show fake success toast (dark pattern: lie)
      setIsSubmitted(true);
      setShowToast(true);
    } else {
      // Duplicate submission = fail
      onFail();
    }
    // NO real visual feedback - broken state feedback dark pattern
  }, [allFields, formData, isSubmitted, onFail]);

  // "다시 제출" trap - clicking this after the fake toast = fail
  const handleResubmitTrap = useCallback(() => {
    setAllFields((prev) => {
      let updated = params.wrongCloseAddsLayer
        ? [...prev, `추가 항목 ${prev.length + 1}`]
        : [...prev];
      if (params.shuffleOnMiss) {
        for (let i = updated.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [updated[i], updated[j]] = [updated[j]!, updated[i]!];
        }
      }
      return updated;
    });
    setShowResubmit(false);
    onFail();
  }, [params.wrongCloseAddsLayer, params.shuffleOnMiss, onFail]);

  const handleViewStatus = useCallback(() => {
    setShowStatus(true);
    if (isSubmitted && params.requireStatusCheck) {
      onComplete();
    }
  }, [isSubmitted, params.requireStatusCheck, onComplete]);

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>요청서 제출</h2>
        <p style={subtitleStyle}>모든 항목을 입력하고 제출하세요</p>

        {allFields.map((field) => {
          const value = formData[field] ?? "";
          return (
            <div key={field} style={fieldContainerStyle}>
              <label style={labelStyle}>{field}</label>
              <input
                type="text"
                style={inputStyle}
                value={value}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={`${field} 입력`}
              />
            </div>
          );
        })}

        <button
          type="button"
          style={submitButtonStyle}
          onClick={handleSubmit}
        >
          제출
        </button>

        {/* "다시 제출" trap - appears after fake toast */}
        {showResubmit && (
          <button
            type="button"
            style={resubmitTrapStyle}
            onClick={handleResubmitTrap}
          >
            다시 제출
          </button>
        )}

        {/* Status link: hidden in bottom-right corner, ambiguous label */}
        <div style={statusLinkContainerStyle}>
          <button
            type="button"
            style={statusLinkStyle}
            onClick={handleViewStatus}
          >
            더보기
          </button>
        </div>
      </div>

      {/* Fake success toast - lies to the user */}
      {showToast && (
        <div
          style={{
            ...toastStyle,
            opacity: toastVisible ? 1 : 0,
          }}
        >
          제출 완료!
        </div>
      )}

      {showStatus && (
        <div style={statusModalOverlayStyle}>
          <div style={statusModalStyle}>
            <h3 style={statusTitleStyle}>상태</h3>
            {isSubmitted ? (
              <p style={statusTextStyle}>요청이 접수되었습니다</p>
            ) : (
              <p style={statusTextStyle}>제출된 요청이 없습니다</p>
            )}
            <button
              type="button"
              style={closeButtonStyle}
              onClick={() => setShowStatus(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  backgroundColor: "#f9fafb",
  padding: "16px",
};

const formContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 400,
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: "24px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 8px 0",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#8B95A1",
  margin: "0 0 24px 0",
};

const fieldContainerStyle: React.CSSProperties = {
  marginBottom: "16px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#4E5968",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  border: "1px solid #e5e8eb",
  borderRadius: 6,
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "#3182F6",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  marginTop: "8px",
  WebkitTapHighlightColor: "transparent",
};

// Trap button: looks like a helpful resubmit but calls onFail
const resubmitTrapStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  fontSize: 14,
  fontWeight: 500,
  color: "#3182F6",
  backgroundColor: "#EFF6FF",
  border: "1px solid #BFDBFE",
  borderRadius: 8,
  cursor: "pointer",
  marginTop: "10px",
  WebkitTapHighlightColor: "transparent",
};

// Hidden in bottom-right corner, low opacity, ambiguous label
const statusLinkContainerStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 8,
  right: 8,
};

const statusLinkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "rgba(139, 149, 161, 0.5)",
  fontSize: 10,
  textDecoration: "underline",
  cursor: "pointer",
  padding: "2px",
  WebkitTapHighlightColor: "transparent",
};

// Fake green success toast
const toastStyle: React.CSSProperties = {
  position: "fixed",
  top: 24,
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#16a34a",
  color: "#fff",
  padding: "10px 24px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  zIndex: 2000,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  transition: "opacity 0.4s ease",
  pointerEvents: "none",
};

const statusModalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const statusModalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: "24px",
  width: 280,
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
};

const statusTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 16px 0",
};

const statusTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4E5968",
  margin: "0 0 20px 0",
};

const closeButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  fontSize: 14,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "#3182F6",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};
