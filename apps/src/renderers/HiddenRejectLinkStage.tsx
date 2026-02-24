import { useCallback } from "react";
import type React from "react";

export interface HiddenRejectLinkParams {
  linkPosition: "bottom-left" | "bottom-right" | "inline-text" | "after-tos";
  linkOpacity: number;
  ctaText: string;
}

interface StageRendererProps {
  params: HiddenRejectLinkParams;
  onComplete: () => void;
  onFail: () => void;
}

export default function HiddenRejectLinkStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const handleReject = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleAccept = useCallback(() => {
    onFail();
  }, [onFail]);

  const linkStyle: React.CSSProperties = {
    fontSize: 10,
    color: `rgba(139, 149, 161, ${params.linkOpacity})`,
    textDecoration: "none",
    cursor: "pointer",
    padding: "4px",
    lineHeight: 1.2,
    WebkitTapHighlightColor: "transparent",
  };

  const renderRejectLink = () => (
    <button type="button" style={linkStyle} onClick={handleReject}>
      괜찮습니다, 다음에 할게요
    </button>
  );

  return (
    <div style={containerStyle}>
      <div style={contentBoxStyle}>
        <div style={headerStyle}>
          <div style={badgeStyle}>🎉 특별 제안</div>
          <div style={urgencyBadgeStyle}>⏰ 남은 자리: 2개</div>
        </div>

        <h1 style={mainTitleStyle}>프리미엄 무료 체험</h1>
        <h2 style={subTitleStyle}>30일 동안 완전 무료!</h2>

        <div style={benefitsBoxStyle}>
          <div style={benefitItemStyle}>✓ 광고 없는 경험</div>
          <div style={benefitItemStyle}>✓ 무제한 이용</div>
          <div style={benefitItemStyle}>✓ 프리미엄 콘텐츠 접근</div>
          <div style={benefitItemStyle}>✓ 우선 고객 지원</div>
        </div>

        <button type="button" style={ctaButtonStyle} onClick={handleAccept}>
          {params.ctaText}
        </button>

        <div style={disclaimerTextStyle}>
          * 체험 종료 후 자동으로 유료 전환됩니다. 언제든지 취소 가능합니다.
        </div>

        {params.linkPosition === "inline-text" && (
          <div style={inlineTextContainerStyle}>
            지금은 프리미엄이 필요하지 않으신가요?{" "}
            {renderRejectLink()}
          </div>
        )}

        {params.linkPosition === "after-tos" && (
          <div style={tosContainerStyle}>
            <p style={tosTextStyle}>
              이용약관 및 개인정보처리방침에 동의합니다. 서비스 이용 시 자동으로
              정기결제에 동의한 것으로 간주됩니다.
            </p>
            {renderRejectLink()}
          </div>
        )}

        {params.linkPosition === "bottom-left" && (
          <div style={bottomLeftLinkStyle}>{renderRejectLink()}</div>
        )}

        {params.linkPosition === "bottom-right" && (
          <div style={bottomRightLinkStyle}>{renderRejectLink()}</div>
        )}
      </div>

      <div style={decorativeTextStyle}>
        🔥 지금 가입한 사용자 847명!
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
