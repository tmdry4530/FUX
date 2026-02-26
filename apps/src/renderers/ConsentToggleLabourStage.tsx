import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";

export interface ConsentToggleLabourParams {
  toggleCount: number;
  hasRejectAll: false;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
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
  isDoubleNegative: boolean; // ON = 거부됨, OFF = 허용됨 (이중 부정)
}

// 이중 부정 레이블: "마케팅 수신 거부 해제" => OFF 해야 진짜 거부
const DOUBLE_NEGATIVE_LABELS = [
  "마케팅 수신 거부 해제",
  "광고 수신 차단 비활성화",
  "개인정보 공유 중지 취소",
  "데이터 수집 거부 해제",
];

const DEFAULT_LABELS = [
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

function buildToggles(count: number): ToggleItem[] {
  return DEFAULT_LABELS.slice(0, count).map((item, idx) => {
    // 비필수 항목 중 일부를 이중 부정으로 지정 (3번째마다)
    const isDoubleNegative = !item.isEssential && idx % 3 === 2;
    const label = isDoubleNegative
      ? (DOUBLE_NEGATIVE_LABELS[Math.floor(idx / 3) % DOUBLE_NEGATIVE_LABELS.length] ?? item.label)
      : item.label;
    return {
      id: `toggle-${idx}`,
      label,
      isEssential: item.isEssential,
      enabled: true,
      isDoubleNegative,
    };
  });
}

// 이중 부정 토글은 enabled=true가 "거부 해제됨" = 실제로 허용 중
// 올바른 완료 조건: 일반 비필수는 enabled=false, 이중 부정은 enabled=true (그대로 두면 함정)
// 이중 부정을 올바르게 처리: 이중 부정 토글은 OFF(enabled=false)가 "마케팅 거부 해제 비활성" = 결국 마케팅 거부됨
// 단순하게: 모든 비필수를 OFF로 만들어야 완료 (이중 부정이든 아니든 모두 OFF가 정답)
function isAllNonEssentialOff(toggles: ToggleItem[]): boolean {
  return toggles.filter((t) => !t.isEssential).every((t) => !t.enabled);
}

// 현재 off된 비필수 개수
function offCount(toggles: ToggleItem[]): number {
  return toggles.filter((t) => !t.isEssential && !t.enabled).length;
}

export default function ConsentToggleLabourStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [toggles, setToggles] = useState<ToggleItem[]>(() =>
    buildToggles(params.toggleCount),
  );
  const [showRecommendPopup, setShowRecommendPopup] = useState(false);
  const [reEnableFlash, setReEnableFlash] = useState<Set<string>>(new Set());

  const offCountRef = useRef(0);
  const recommendShownRef = useRef(false);
  const reEnableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalNonEssential = toggles.filter((t) => !t.isEssential).length;
  const currentOffCount = offCount(toggles);

  // 추천 설정 팝업: 절반 이상 껐을 때 1회 표시
  useEffect(() => {
    if (
      !recommendShownRef.current &&
      currentOffCount >= Math.ceil(totalNonEssential / 2)
    ) {
      recommendShownRef.current = true;
      setShowRecommendPopup(true);
    }
  }, [currentOffCount, totalNonEssential]);

  // 무작위 재활성화 트랩: 3개 이상 껐을 때 2-3초 후 1-2개 무작위 재활성화
  useEffect(() => {
    if (currentOffCount >= 3 && currentOffCount > offCountRef.current) {
      offCountRef.current = currentOffCount;

      if (reEnableTimerRef.current) {
        clearTimeout(reEnableTimerRef.current);
      }

      const delay = 2000 + Math.random() * 1000;
      reEnableTimerRef.current = setTimeout(() => {
        setToggles((prev) => {
          const offItems = prev.filter((t) => !t.isEssential && !t.enabled);
          if (offItems.length === 0) return prev;

          // 1-2개 무작위 선택
          const reEnableCount = Math.min(
            Math.floor(Math.random() * 2) + 1,
            offItems.length,
          );
          const shuffled = [...offItems].sort(() => Math.random() - 0.5);
          const toReEnable = new Set(
            shuffled.slice(0, reEnableCount).map((t) => t.id),
          );

          // 플래시 애니메이션용
          setReEnableFlash(toReEnable);
          setTimeout(() => setReEnableFlash(new Set()), 800);

          return prev.map((t) =>
            toReEnable.has(t.id) ? { ...t, enabled: true } : t,
          );
        });
      }, delay);
    }

    return () => {
      if (reEnableTimerRef.current) {
        clearTimeout(reEnableTimerRef.current);
      }
    };
  }, [currentOffCount]);

  const handleToggle = useCallback((id: string) => {
    setToggles((prev) =>
      prev.map((t) =>
        t.id === id && !t.isEssential ? { ...t, enabled: !t.enabled } : t,
      ),
    );
  }, []);

  const addExtraToggles = useCallback(() => {
    setToggles((prev) => {
      const currentCount = prev.length;
      const addCount = Math.floor(Math.random() * 2) + 1;
      const newTotal = Math.min(currentCount + addCount, DEFAULT_LABELS.length);
      if (newTotal <= currentCount) return prev;
      const extras = DEFAULT_LABELS.slice(currentCount, newTotal).map((item, relIdx) => {
        const idx = currentCount + relIdx;
        const isDoubleNegative = !item.isEssential && idx % 3 === 2;
        const label = isDoubleNegative
          ? (DOUBLE_NEGATIVE_LABELS[Math.floor(idx / 3) % DOUBLE_NEGATIVE_LABELS.length] ?? item.label)
          : item.label;
        return {
          id: `toggle-${idx}`,
          label,
          isEssential: item.isEssential,
          enabled: true,
          isDoubleNegative,
        };
      });
      return [...prev, ...extras];
    });
  }, []);

  const shuffleToggles = useCallback(() => {
    setToggles((prev) => {
      const essential = prev.filter((t) => t.isEssential);
      const nonEssential = [...prev.filter((t) => !t.isEssential)].sort(() => Math.random() - 0.5);
      return [...essential, ...nonEssential];
    });
  }, []);

  // "모두 허용" - 회색 버튼으로 보이지만 함정 (onFail)
  const handleAcceptAll = useCallback(() => {
    if (params.wrongCloseAddsLayer) addExtraToggles();
    if (params.shuffleOnMiss) shuffleToggles();
    onFail();
  }, [onFail, params.wrongCloseAddsLayer, params.shuffleOnMiss, addExtraToggles, shuffleToggles]);

  // "설정 저장" - 파란 버튼 (눈에 띄는 CTA처럼 보임)
  // 모든 비필수가 OFF이면 완료, 아직 켜진 게 있으면 onFail (잘못된 저장)
  const handleSave = useCallback(() => {
    if (isAllNonEssentialOff(toggles)) {
      onComplete();
    } else {
      // 아직 켜진 비필수가 있는 채로 저장 시도 = 실패
      onFail();
    }
  }, [toggles, onComplete, onFail]);

  // 추천 설정 적용 = 모든 토글 ON 초기화 + onFail
  const handleApplyRecommend = useCallback(() => {
    setToggles((prev) => prev.map((t) => ({ ...t, enabled: true })));
    recommendShownRef.current = false; // 다시 팝업 뜰 수 있도록
    offCountRef.current = 0;
    setShowRecommendPopup(false);
    if (params.wrongCloseAddsLayer) addExtraToggles();
    if (params.shuffleOnMiss) shuffleToggles();
    onFail();
  }, [onFail, params.wrongCloseAddsLayer, params.shuffleOnMiss, addExtraToggles, shuffleToggles]);

  const handleDismissRecommend = useCallback(() => {
    setShowRecommendPopup(false);
  }, []);

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h2 style={titleStyle}>개인정보 설정 관리</h2>
        <p style={descStyle}>
          서비스 개선을 위해 쿠키 및 유사 기술을 사용합니다. 아래에서 각 항목을
          관리하실 수 있습니다.
        </p>

        <div style={progressIndicatorStyle}>
          설정 완료: {currentOffCount} / {totalNonEssential} 항목 거부됨
        </div>

        <div style={toggleListStyle}>
          {toggles.map((toggle) => {
            const isFlashing = reEnableFlash.has(toggle.id);
            return (
              <div
                key={toggle.id}
                style={{
                  ...toggleRowStyle,
                  backgroundColor: isFlashing ? "#fef3c7" : "#f9fafb",
                  transition: "background-color 0.3s",
                }}
              >
                <div style={toggleLabelContainerStyle}>
                  <span style={toggleLabelStyle}>
                    {toggle.label}
                    {toggle.isEssential && (
                      <span style={essentialBadgeStyle}>(필수)</span>
                    )}
                    {toggle.isDoubleNegative && !toggle.isEssential && (
                      <span style={doubleNegativeBadgeStyle}>(주의)</span>
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
            );
          })}
        </div>

        <div style={buttonContainerStyle}>
          {/* 버튼 역전: "설정 저장"이 파란 강조 버튼, "모두 허용"이 회색 */}
          <button type="button" style={saveButtonStyle} onClick={handleSave}>
            설정 저장
          </button>
          <button
            type="button"
            style={acceptAllButtonStyle}
            onClick={handleAcceptAll}
          >
            모두 허용
          </button>
        </div>

        <p style={hintTextStyle}>
          모든 선택 항목을 거부하려면 각 토글을 수동으로 꺼야 합니다.
        </p>
      </div>

      {/* 추천 설정 팝업 */}
      {showRecommendPopup && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h3 style={popupTitleStyle}>추천 설정 적용</h3>
            <p style={popupDescStyle}>
              더 나은 서비스 경험을 위해 추천 설정을 적용하시겠습니까?
            </p>
            <button
              type="button"
              style={popupPrimaryButtonStyle}
              onClick={handleApplyRecommend}
            >
              적용
            </button>
            <button
              type="button"
              style={popupSkipLinkStyle}
              onClick={handleDismissRecommend}
            >
              건너뛰기
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

const doubleNegativeBadgeStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#f59e0b",
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

// 역전: "설정 저장"이 파란색 강조 버튼 (함정: 아직 켜진 게 있으면 onFail)
const saveButtonStyle: React.CSSProperties = {
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

// 역전: "모두 허용"이 회색 버튼 (덜 눈에 띄지만 여전히 함정)
const acceptAllButtonStyle: React.CSSProperties = {
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

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 200,
};

const popupStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: "28px 24px",
  maxWidth: 340,
  width: "90%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
};

const popupTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#191F28",
  margin: 0,
  textAlign: "center",
};

const popupDescStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4E5968",
  margin: 0,
  textAlign: "center",
  lineHeight: 1.6,
};

const popupPrimaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "#3182F6",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const popupSkipLinkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 12,
  color: "#8B95A1",
  cursor: "pointer",
  padding: "4px",
  textDecoration: "underline",
};
