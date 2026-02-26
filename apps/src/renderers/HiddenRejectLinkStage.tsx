import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";

export interface HiddenRejectLinkParams {
  linkPosition: "bottom-left" | "bottom-right" | "inline-text" | "after-tos";
  linkOpacity: number;
  ctaText: string;
  fakeRejectLinks?: boolean;
  scrollableToS?: boolean;
  timerPopup?: boolean;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface StageRendererProps {
  params: HiddenRejectLinkParams;
  onComplete: () => void;
  onFail: () => void;
}

const REJECT_LABELS = ["괜찮습니다", "나중에", "건너뛰기"];

const TOS_TEXT = `제1조 (목적) 이 약관은 회사가 제공하는 프리미엄 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의) "서비스"라 함은 회사가 제공하는 모든 유료 및 무료 서비스를 의미합니다. "이용자"라 함은 이 약관에 따라 회사가 제공하는 서비스를 받는 자를 말합니다.

제3조 (약관의 효력 및 변경) 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대해 그 효력을 발생합니다. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 공시합니다.

제4조 (서비스 이용계약의 성립) 이용계약은 이용자의 이용신청에 대해 회사가 승낙함으로써 성립합니다. 회사는 이용신청자의 신청에 대해 서비스 이용을 승낙함을 원칙으로 합니다.

제5조 (개인정보보호) 회사는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 이를 준수합니다. 이용자의 개인정보는 서비스 제공 목적으로만 활용됩니다.

제6조 (요금 및 결제) 유료 서비스 이용 요금은 회사가 정한 요금표에 따릅니다. 무료 체험 종료 후 자동으로 유료로 전환되며, 이에 대한 별도 고지 없이 결제가 진행될 수 있습니다.

제7조 (서비스 중단) 회사는 시스템 점검, 설비 증설 및 교체, 설비의 장애 등의 사유로 서비스를 일시 중단할 수 있습니다.`;

const POSITION_CYCLE = ["bottom-left", "bottom-right", "inline-text", "after-tos"] as const;

export default function HiddenRejectLinkStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [rejectLabelIndex] = useState(() => Math.floor(Math.random() * REJECT_LABELS.length));
  const [currentOpacity, setCurrentOpacity] = useState(params.linkOpacity);
  const [currentPosition, setCurrentPosition] = useState(params.linkPosition);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popupCloseCount, setPopupCloseCount] = useState(0);

  // Timer popup after 5 seconds (first appearance)
  useEffect(() => {
    if (!params.timerPopup) return;
    popupTimerRef.current = setTimeout(() => setShowPopup(true), 5000);
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [params.timerPopup]);

  // Re-show popup after close with minimum 3s delay
  useEffect(() => {
    if (!params.timerPopup || popupCloseCount === 0) return;
    popupTimerRef.current = setTimeout(() => setShowPopup(true), 3000 + Math.random() * 2000);
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [popupCloseCount, params.timerPopup]);

  const handleReject = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleAccept = useCallback(() => {
    onFail();
  }, [onFail]);

  // Fake reject links that are actually accept traps
  const handleFakeReject = useCallback(() => {
    if (params.wrongCloseAddsLayer) {
      setCurrentOpacity((prev) => Math.max(0.03, prev - 0.05));
    }
    if (params.shuffleOnMiss) {
      setCurrentPosition((prev) => {
        const idx = POSITION_CYCLE.indexOf(prev as typeof POSITION_CYCLE[number]);
        return POSITION_CYCLE[(idx === -1 ? 0 : (idx + 1)) % POSITION_CYCLE.length]!;
      });
    }
    onFail();
  }, [params.wrongCloseAddsLayer, params.shuffleOnMiss, onFail]);

  const handlePopupAccept = useCallback(() => {
    setShowPopup(false);
    onFail();
  }, [onFail]);

  const handlePopupClose = useCallback(() => {
    setShowPopup(false);
    setPopupCloseCount((n) => n + 1);
  }, []);

  const linkStyle: React.CSSProperties = {
    fontSize: 10,
    color: `rgba(139, 149, 161, ${currentOpacity})`,
    textDecoration: "none",
    cursor: "pointer",
    padding: "4px",
    lineHeight: 1.2,
    WebkitTapHighlightColor: "transparent",
    background: "none",
    border: "none",
  };

  const currentRejectLabel = REJECT_LABELS[rejectLabelIndex] ?? "괜찮습니다";

  const renderRejectLink = () => (
    <button type="button" style={linkStyle} onClick={handleReject}>
      {currentRejectLabel}
    </button>
  );

  return (
    <div style={containerStyle}>
      <div style={contentBoxStyle}>
        <div style={headerStyle}>
          <div style={badgeStyle}>특별 제안</div>
          <div style={urgencyBadgeStyle}>남은 자리: 2개</div>
        </div>

        <h1 style={mainTitleStyle}>프리미엄 무료 체험</h1>
        <h2 style={subTitleStyle}>30일 동안 완전 무료!</h2>

        <div style={benefitsBoxStyle}>
          <div style={benefitItemStyle}>광고 없는 경험</div>
          <div style={benefitItemStyle}>무제한 이용</div>
          <div style={benefitItemStyle}>프리미엄 콘텐츠 접근</div>
          <div style={benefitItemStyle}>우선 고객 지원</div>
        </div>

        <button type="button" style={ctaButtonStyle} onClick={handleAccept}>
          {params.ctaText}
        </button>

        {/* Fake reject links: look like reject but are accept traps */}
        {params.fakeRejectLinks && (
          <div style={fakeRejectContainerStyle}>
            <button type="button" style={fakeRejectLinkStyle} onClick={handleFakeReject}>
              무료 체험 건너뛰기
            </button>
            <button type="button" style={fakeRejectLinkStyle} onClick={handleFakeReject}>
              기본 플랜으로 계속
            </button>
          </div>
        )}

        <div style={disclaimerTextStyle}>
          * 체험 종료 후 자동으로 유료 전환됩니다. 언제든지 취소 가능합니다.
        </div>

        {/* Scrollable ToS - real reject link is only visible after scrolling */}
        {params.scrollableToS && (
          <div style={tosScrollContainerStyle}>
            <div style={tosScrollInnerStyle}>
              <p style={tosTextStyle}>{TOS_TEXT}</p>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                {renderRejectLink()}
              </div>
            </div>
          </div>
        )}

        {!params.scrollableToS && currentPosition === "inline-text" && (
          <div style={inlineTextContainerStyle}>
            지금은 프리미엄이 필요하지 않으신가요?{" "}
            {renderRejectLink()}
          </div>
        )}

        {!params.scrollableToS && currentPosition === "after-tos" && (
          <div style={tosContainerStyle}>
            <p style={tosTextStyle}>
              이용약관 및 개인정보처리방침에 동의합니다. 서비스 이용 시 자동으로
              정기결제에 동의한 것으로 간주됩니다.
            </p>
            {renderRejectLink()}
          </div>
        )}

        {!params.scrollableToS && currentPosition === "bottom-left" && (
          <div style={bottomLeftLinkStyle}>{renderRejectLink()}</div>
        )}

        {!params.scrollableToS && currentPosition === "bottom-right" && (
          <div style={bottomRightLinkStyle}>{renderRejectLink()}</div>
        )}
      </div>

      <div style={decorativeTextStyle}>
        지금 가입한 사용자 847명!
      </div>

      {/* Timer popup: appears after 5s, "가입" = fail, tiny "닫기" = just close */}
      {showPopup && (
        <div style={popupOverlayStyle}>
          <div style={popupBoxStyle}>
            <p style={popupTitleStyle}>지금 가입하면 추가 혜택!</p>
            <p style={popupSubStyle}>첫 달 50% 할인 + 추가 기능 무료</p>
            <button type="button" style={popupCtaStyle} onClick={handlePopupAccept}>
              가입
            </button>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button type="button" style={popupCloseStyle} onClick={handlePopupClose}>
                닫기
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
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "24px",
};

const contentBoxStyle: React.CSSProperties = {
  position: "relative",
  maxWidth: 480,
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: 24,
  padding: "32px 24px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginBottom: 24,
  flexWrap: "wrap",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#fef3c7",
  color: "#92400e",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 16,
};

const urgencyBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 16,
};

const mainTitleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 8px 0",
};

const subTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 500,
  color: "#4E5968",
  margin: "0 0 24px 0",
};

const benefitsBoxStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginBottom: 24,
  padding: "20px",
  backgroundColor: "#f9fafb",
  borderRadius: 12,
};

const benefitItemStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#191F28",
  textAlign: "left",
  fontWeight: 500,
};

const ctaButtonStyle: React.CSSProperties = {
  width: "60%",
  padding: "18px 32px",
  fontSize: 18,
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
  WebkitTapHighlightColor: "transparent",
  margin: "0 auto",
  display: "block",
};

// Fake reject links - look like skip/reject but are accept traps
const fakeRejectContainerStyle: React.CSSProperties = {
  marginTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  alignItems: "center",
};

const fakeRejectLinkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#6b7684",
  fontSize: 12,
  textDecoration: "underline",
  cursor: "pointer",
  padding: "2px 4px",
  WebkitTapHighlightColor: "transparent",
};

const disclaimerTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#8B95A1",
  marginTop: 16,
  lineHeight: 1.4,
};

const inlineTextContainerStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#4E5968",
  marginTop: 16,
  lineHeight: 1.6,
};

const tosContainerStyle: React.CSSProperties = {
  marginTop: 20,
  padding: "12px",
  backgroundColor: "#f9fafb",
  borderRadius: 8,
  textAlign: "left",
};

const tosTextStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#8B95A1",
  margin: "0 0 8px 0",
  lineHeight: 1.4,
};

// Scrollable ToS container - reject link hidden at bottom after long text
const tosScrollContainerStyle: React.CSSProperties = {
  marginTop: 16,
  border: "1px solid #e5e8eb",
  borderRadius: 8,
  height: 120,
  overflowY: "scroll",
  textAlign: "left",
};

const tosScrollInnerStyle: React.CSSProperties = {
  padding: "12px",
};

const bottomLeftLinkStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 12,
  left: 12,
};

const bottomRightLinkStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 12,
  right: 12,
};

const decorativeTextStyle: React.CSSProperties = {
  marginTop: 20,
  fontSize: 14,
  fontWeight: 600,
  color: "#fff",
  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
};

// Timer popup styles
const popupOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const popupBoxStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: "28px 24px 20px",
  width: 280,
  textAlign: "center",
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
};

const popupTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 8px 0",
};

const popupSubStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#4E5968",
  margin: "0 0 20px 0",
};

const popupCtaStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  fontSize: 16,
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};

// Intentionally tiny and low-contrast
const popupCloseStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "rgba(139, 149, 161, 0.5)",
  fontSize: 10,
  cursor: "pointer",
  padding: "2px 4px",
  WebkitTapHighlightColor: "transparent",
};
