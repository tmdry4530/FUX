import { useState, useCallback } from "react";
import type React from "react";

export interface RoachMotelFlowParams {
  steps: number;
  requireTyping: boolean;
}

interface StageRendererProps {
  params: RoachMotelFlowParams;
  onComplete: () => void;
  onFail: () => void;
}

export default function RoachMotelFlowStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [gaveUpCount, setGaveUpCount] = useState(0);

  const handleStaySubscribed = useCallback(() => {
    const next = gaveUpCount + 1;
    setGaveUpCount(next);
    if (next >= 3) {
      onFail();
    }
  }, [gaveUpCount, onFail]);

  const handleContinueCancel = useCallback(() => {
    const nextStep = currentStep + 1;
    if (nextStep >= params.steps) {
      onComplete();
    } else {
      setCurrentStep(nextStep);
      setTypedText("");
    }
  }, [currentStep, params.steps, onComplete]);

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedText(e.target.value);
    },
    [],
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={stepContainerStyle}>
            <div style={successBadgeStyle}>✓</div>
            <h2 style={titleStyle}>구독 중입니다!</h2>
            <p style={descStyle}>
              프리미엄 혜택을 모두 이용하고 계십니다.
            </p>
            <button type="button" style={primaryButtonStyle} onClick={handleStaySubscribed}>
              계속 이용하기
            </button>
            <button type="button" style={tinyLinkStyle} onClick={handleContinueCancel}>
              구독 관리
            </button>
          </div>
        );

      case 1:
        return (
          <div style={stepContainerStyle}>
            <h2 style={titleStyle}>정말 취소하시겠어요?</h2>
            <p style={descStyle}>
              다음 혜택을 더 이상 받을 수 없습니다:
            </p>
            <ul style={benefitsListStyle}>
              <li>무제한 이용</li>
              <li>광고 없는 경험</li>
              <li>프리미엄 콘텐츠 접근</li>
            </ul>
            <button type="button" style={primaryButtonStyle} onClick={handleStaySubscribed}>
              혜택 유지하기
            </button>
            <button type="button" style={secondaryLinkStyle} onClick={handleContinueCancel}>
              그래도 취소
            </button>
          </div>
        );

      case 2:
        return (
          <div style={stepContainerStyle}>
            <h2 style={titleStyle}>특별 제안!</h2>
            <div style={offerBoxStyle}>
              <p style={offerTextStyle}>지금 유지하시면</p>
              <p style={offerHighlightStyle}>50% 할인</p>
              <p style={offerTextStyle}>다음 3개월</p>
            </div>
            <button type="button" style={primaryButtonStyle} onClick={handleStaySubscribed}>
              할인 받기
            </button>
            <button type="button" style={secondaryLinkStyle} onClick={handleContinueCancel}>
              할인 거부
            </button>
          </div>
        );

      case 3:
        return (
          <div style={stepContainerStyle}>
            <h2 style={titleStyle}>취소 사유를 알려주세요</h2>
            <p style={descStyle}>더 나은 서비스를 위해 의견을 들려주세요</p>
            <div style={reasonListStyle}>
              <label style={radioLabelStyle}>
                <input type="radio" name="reason" style={radioInputStyle} />
                <span>너무 비싸요</span>
              </label>
              <label style={radioLabelStyle}>
                <input type="radio" name="reason" style={radioInputStyle} />
                <span>잘 사용하지 않아요</span>
              </label>
              <label style={radioLabelStyle}>
                <input type="radio" name="reason" style={radioInputStyle} />
                <span>다른 서비스로 이동</span>
              </label>
              <label style={radioLabelStyle}>
                <input type="radio" name="reason" style={radioInputStyle} />
                <span>기타</span>
              </label>
            </div>
            <button type="button" style={primaryButtonStyle} onClick={handleStaySubscribed}>
              다시 생각해볼게요
            </button>
            <button type="button" style={secondaryLinkStyle} onClick={handleContinueCancel}>
              계속 진행
            </button>
          </div>
        );

      case 4:
      default:
        if (params.requireTyping) {
          const canProceed = typedText.trim().toUpperCase() === "CANCEL";
          return (
            <div style={stepContainerStyle}>
              <h2 style={titleStyle}>최종 확인</h2>
              <p style={descStyle}>
                정말로 취소하시려면 아래에 <strong>CANCEL</strong>을 입력하세요
              </p>
              <input
                type="text"
                value={typedText}
                onChange={handleTypeChange}
                placeholder="여기에 입력하세요"
                style={textInputStyle}
              />
              <button type="button" style={primaryButtonStyle} onClick={handleStaySubscribed}>
                구독 유지
              </button>
              <button
                type="button"
                style={{
                  ...tinyLinkStyle,
                  opacity: canProceed ? 1 : 0.3,
                  pointerEvents: canProceed ? "auto" : "none",
                }}
                onClick={canProceed ? handleContinueCancel : undefined}
              >
                구독 취소
              </button>
            </div>
          );
        } else {
          return (
            <div style={stepContainerStyle}>
              <h2 style={titleStyle}>최종 확인</h2>
              <p style={descStyle}>
                구독을 취소하면 모든 혜택이 즉시 중단됩니다.
              </p>
              <button type="button" style={primaryButtonStyle} onClick={handleStaySubscribed}>
                구독 유지
              </button>
              <button type="button" style={tinyLinkStyle} onClick={handleContinueCancel}>
                구독 취소
              </button>
            </div>
          );
        }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={progressBarContainerStyle}>
        <div
          style={{
            ...progressBarFillStyle,
            width: `${((currentStep + 1) / params.steps) * 100}%`,
          }}
        />
      </div>
      {renderStep()}
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f9fafb",
  padding: "24px",
};

const progressBarContainerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  backgroundColor: "#e5e7eb",
};

const progressBarFillStyle: React.CSSProperties = {
  height: "100%",
  backgroundColor: "#3182F6",
  transition: "width 0.3s ease",
};

const stepContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  maxWidth: 400,
  width: "100%",
  backgroundColor: "#fff",
  padding: "32px 24px",
  borderRadius: 16,
  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
};

const successBadgeStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  backgroundColor: "#10b981",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 32,
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#191F28",
  margin: 0,
  textAlign: "center",
};

const descStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#4E5968",
  margin: 0,
  textAlign: "center",
};

const benefitsListStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  width: "100%",
};

const offerBoxStyle: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  padding: "24px",
  borderRadius: 12,
  textAlign: "center",
  width: "100%",
};

const offerTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#92400e",
  margin: "4px 0",
};

const offerHighlightStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: "#b45309",
  margin: "8px 0",
};

const reasonListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "100%",
};

const radioLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: 14,
  color: "#191F28",
  cursor: "pointer",
};

const radioInputStyle: React.CSSProperties = {
  cursor: "pointer",
};

const textInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontSize: 14,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 24px",
  fontSize: 16,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "#3182F6",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};

const secondaryLinkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 13,
  color: "#8B95A1",
  cursor: "pointer",
  padding: "8px",
  textDecoration: "underline",
  WebkitTapHighlightColor: "transparent",
};

const tinyLinkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 11,
  color: "#8B95A1",
  cursor: "pointer",
  padding: "4px",
  textDecoration: "underline",
  WebkitTapHighlightColor: "transparent",
};
