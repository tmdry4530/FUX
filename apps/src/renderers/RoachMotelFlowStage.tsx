import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";

export interface RoachMotelFlowParams {
  steps: number;
  requireTyping: boolean;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface StageRendererProps {
  params: RoachMotelFlowParams;
  onComplete: () => void;
  onFail: () => void;
}

// 버튼 레이아웃 변형: 취소 계속 버튼 위치를 무작위로 배치
type LayoutVariant = "cancel_top" | "cancel_bottom" | "swap" | "buried_text" | "bottom_right";

function getRandomLayout(): LayoutVariant {
  const layouts: LayoutVariant[] = ["cancel_top", "cancel_bottom", "swap", "buried_text", "bottom_right"];
  return layouts[Math.floor(Math.random() * layouts.length)] as LayoutVariant;
}

function renderButtons(
  layout: LayoutVariant,
  stayLabel: string,
  cancelLabel: string,
  onStay: () => void,
  onCancel: () => void,
  cancelDisabled?: boolean,
): React.ReactNode {
  const stayBtn = (
    <button key="stay" type="button" style={primaryButtonStyle} onClick={onStay}>
      {stayLabel}
    </button>
  );

  const cancelBtnBase: React.CSSProperties = cancelDisabled
    ? { ...tinyLinkStyle, opacity: 0.3, pointerEvents: "none" as const }
    : tinyLinkStyle;

  if (layout === "cancel_top") {
    return (
      <>
        <button key="cancel-top" type="button" style={cancelBtnBase} onClick={cancelDisabled ? undefined : onCancel}>
          {cancelLabel}
        </button>
        {stayBtn}
      </>
    );
  }
  if (layout === "swap") {
    const swappedCancel = (
      <button key="cancel-swap" type="button" style={primaryButtonStyle} onClick={cancelDisabled ? undefined : onCancel}>
        {cancelLabel}
      </button>
    );
    const swappedStay = (
      <button key="stay-swap" type="button" style={tinyLinkStyle} onClick={onStay}>
        {stayLabel}
      </button>
    );
    return (
      <>
        {swappedCancel}
        {swappedStay}
      </>
    );
  }
  if (layout === "buried_text") {
    return (
      <>
        {stayBtn}
        <p style={{ fontSize: 12, color: "#8B95A1", textAlign: "center", margin: 0 }}>
          서비스를 계속 이용하시겠습니까? 구독을 유지하려면 위 버튼을 누르세요.{" "}
          <button
            key="cancel-buried"
            type="button"
            style={{ ...tinyLinkStyle, display: "inline", padding: 0 }}
            onClick={cancelDisabled ? undefined : onCancel}
          >
            {cancelLabel}
          </button>
        </p>
      </>
    );
  }
  if (layout === "bottom_right") {
    return (
      <>
        {stayBtn}
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <button
            key="cancel-br"
            type="button"
            style={{ ...cancelBtnBase, fontSize: 10 }}
            onClick={cancelDisabled ? undefined : onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </>
    );
  }
  // cancel_bottom (default)
  return (
    <>
      {stayBtn}
      <button key="cancel-bot" type="button" style={cancelBtnBase} onClick={cancelDisabled ? undefined : onCancel}>
        {cancelLabel}
      </button>
    </>
  );
}

function CountdownOverlay({ onExpire }: { onExpire: () => void }) {
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (count <= 0) {
      onExpire();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onExpire]);

  return (
    <div style={countdownOverlayStyle}>
      <div style={countdownBoxStyle}>
        <p style={{ margin: 0, fontSize: 14, color: "#4E5968", textAlign: "center" }}>
          {count}초 후 자동으로 구독이 유지됩니다
        </p>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#3182F6", textAlign: "center" }}>
          {count}
        </div>
      </div>
    </div>
  );
}

// Step 9 컴포넌트: buildStepPool 밖에 정의하여 매 렌더마다 함수 레퍼런스가 바뀌지 않도록 함
function FakeProcessingStep({
  onFail,
  onContinue,
}: {
  onFail: () => void;
  onContinue: () => void;
}) {
  const [phase, setPhase] = useState<"loading" | "reset">("loading");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const t = setTimeout(() => {
      if (mountedRef.current) setPhase("reset");
    }, 3000);
    return () => {
      mountedRef.current = false;
      clearTimeout(t);
    };
  }, []);

  if (phase === "loading") {
    return (
      <div style={stepContainerStyle}>
        <h2 style={titleStyle}>취소 처리 중...</h2>
        <div style={fakeProgressBarContainerStyle}>
          <div style={fakeProgressBarFillStyle} />
        </div>
        <p style={descStyle}>잠시만 기다려 주세요.</p>
      </div>
    );
  }
  return (
    <div style={stepContainerStyle}>
      <h2 style={titleStyle}>처리에 실패했습니다</h2>
      <p style={descStyle}>
        일시적인 오류가 발생했습니다. 다시 시도해주세요.
      </p>
      <button type="button" style={primaryButtonStyle} onClick={onFail}>
        구독 유지하기
      </button>
      <button type="button" style={tinyLinkStyle} onClick={onContinue}>
        재시도
      </button>
    </div>
  );
}

// 10개 스텝 풀 정의
function buildStepPool(
  onFail: () => void,
  onContinue: () => void,
  typedText: string,
  onTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  requireTyping: boolean,
  layout: LayoutVariant,
): React.ReactNode[] {
  return [
    // Step 0: 구독 중 화면
    <div key="s0" style={stepContainerStyle}>
      <div style={successBadgeStyle}>✓</div>
      <h2 style={titleStyle}>구독 중입니다!</h2>
      <p style={descStyle}>프리미엄 혜택을 모두 이용하고 계십니다.</p>
      {renderButtons(layout, "계속 이용하기", "구독 관리", onFail, onContinue)}
    </div>,

    // Step 1: 혜택 목록
    <div key="s1" style={stepContainerStyle}>
      <h2 style={titleStyle}>정말 취소하시겠어요?</h2>
      <p style={descStyle}>다음 혜택을 더 이상 받을 수 없습니다:</p>
      <ul style={benefitsListStyle}>
        <li>무제한 이용</li>
        <li>광고 없는 경험</li>
        <li>프리미엄 콘텐츠 접근</li>
      </ul>
      {renderButtons(layout, "혜택 유지하기", "그래도 취소", onFail, onContinue)}
    </div>,

    // Step 2: 할인 제안
    <div key="s2" style={stepContainerStyle}>
      <h2 style={titleStyle}>특별 제안!</h2>
      <div style={offerBoxStyle}>
        <p style={offerTextStyle}>지금 유지하시면</p>
        <p style={offerHighlightStyle}>50% 할인</p>
        <p style={offerTextStyle}>다음 3개월</p>
      </div>
      {renderButtons(layout, "할인 받기", "할인 거부", onFail, onContinue)}
    </div>,

    // Step 3: 취소 사유 설문
    <div key="s3" style={stepContainerStyle}>
      <h2 style={titleStyle}>취소 사유를 알려주세요</h2>
      <p style={descStyle}>더 나은 서비스를 위해 의견을 들려주세요</p>
      <div style={reasonListStyle}>
        {["너무 비싸요", "잘 사용하지 않아요", "다른 서비스로 이동", "기타"].map((r) => (
          <label key={r} style={radioLabelStyle}>
            <input type="radio" name="reason" style={radioInputStyle} />
            <span>{r}</span>
          </label>
        ))}
      </div>
      {renderButtons(layout, "다시 생각해볼게요", "계속 진행", onFail, onContinue)}
    </div>,

    // Step 4: 이중 부정 - "구독 취소를 철회하시겠습니까?" (파란 버튼이 취소 철회 = 구독 유지)
    <div key="s4" style={stepContainerStyle}>
      <h2 style={titleStyle}>구독 취소를 철회하시겠습니까?</h2>
      <p style={descStyle}>취소 요청을 철회하면 구독이 그대로 유지됩니다.</p>
      <button type="button" style={primaryButtonStyle} onClick={onFail}>
        네, 취소를 철회합니다
      </button>
      <button type="button" style={tinyLinkStyle} onClick={onContinue}>
        아니요, 취소를 계속 진행합니다
      </button>
    </div>,

    // Step 5: 포인트 경고
    <div key="s5" style={stepContainerStyle}>
      <h2 style={titleStyle}>적립 포인트가 소멸됩니다</h2>
      <div style={{ ...offerBoxStyle, backgroundColor: "#fef2f2" }}>
        <p style={{ ...offerHighlightStyle, color: "#dc2626" }}>12,500P</p>
        <p style={{ ...offerTextStyle, color: "#7f1d1d" }}>취소 시 즉시 소멸</p>
      </div>
      <p style={descStyle}>포인트는 취소 후 복구되지 않습니다.</p>
      {renderButtons(layout, "포인트 유지하기", "포인트 포기하고 취소", onFail, onContinue)}
    </div>,

    // Step 6: 친구 공유 제안
    <div key="s6" style={stepContainerStyle}>
      <h2 style={titleStyle}>친구에게 공유하면 1개월 무료!</h2>
      <p style={descStyle}>
        친구 1명을 초대하면 다음 달 구독료가 무료입니다. 지금 바로 공유하고 계속 이용하세요.
      </p>
      <button type="button" style={primaryButtonStyle} onClick={onFail}>
        친구 초대하고 무료 혜택 받기
      </button>
      <div style={{ display: "flex", gap: 8, width: "100%" }}>
        <button type="button" style={{ ...secondaryLinkStyle, flex: 1 }} onClick={onFail}>
          나중에 초대하기
        </button>
        <button type="button" style={{ ...tinyLinkStyle, flex: 1 }} onClick={onContinue}>
          혜택 포기
        </button>
      </div>
    </div>,

    // Step 7: 3개 버튼 함정 - 어떤 게 진짜 취소 진행인지 혼란
    <div key="s7" style={stepContainerStyle}>
      <h2 style={titleStyle}>취소 처리 방법을 선택하세요</h2>
      <p style={descStyle}>아래 옵션 중 하나를 선택해주세요.</p>
      <button type="button" style={primaryButtonStyle} onClick={onFail}>
        취소 보류
      </button>
      <button type="button" style={{ ...primaryButtonStyle, backgroundColor: "#6366f1" }} onClick={onFail}>
        취소 예약
      </button>
      <button type="button" style={tinyLinkStyle} onClick={onContinue}>
        취소 진행
      </button>
    </div>,

    // Step 8: 매니저 상담 예약
    <div key="s8" style={stepContainerStyle}>
      <h2 style={titleStyle}>전담 매니저와 상담해보세요</h2>
      <p style={descStyle}>
        구독 혜택을 최대화하는 방법을 안내해드립니다. 지금 바로 상담을 예약하세요.
      </p>
      <button type="button" style={primaryButtonStyle} onClick={onFail}>
        매니저와 상담 예약하기
      </button>
      <button type="button" style={{ ...secondaryLinkStyle }} onClick={onFail}>
        전화 상담 신청
      </button>
      <button type="button" style={tinyLinkStyle} onClick={onContinue}>
        상담 거부
      </button>
    </div>,

    // Step 9: 가짜 처리 중 (안정적인 컴포넌트 참조)
    <FakeProcessingStep key="s9" onFail={onFail} onContinue={onContinue} />,

    // Step 10: 계정 데이터 삭제 경고
    <div key="s10" style={stepContainerStyle}>
      <h2 style={titleStyle}>계정 데이터가 삭제됩니다</h2>
      <div style={{ ...offerBoxStyle, backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
        <p style={{ ...offerTextStyle, color: "#9a3412", fontWeight: 600 }}>삭제 예정 데이터:</p>
        <p style={{ ...offerTextStyle, color: "#9a3412" }}>저장된 결제 정보, 이용 기록, 즐겨찾기</p>
      </div>
      {renderButtons(layout, "데이터 보존하기", "데이터 삭제 후 취소", onFail, onContinue)}
    </div>,

    // Step 11: requireTyping 최종 확인
    (() => {
      const canProceed = typedText.trim().toUpperCase() === "CANCEL";
      if (requireTyping) {
        return (
          <div key="s11-typing" style={stepContainerStyle}>
            <h2 style={titleStyle}>최종 확인</h2>
            <p style={descStyle}>
              정말로 취소하시려면 아래에 <strong>CANCEL</strong>을 입력하세요
            </p>
            <input
              type="text"
              value={typedText}
              onChange={onTypeChange}
              placeholder="여기에 입력하세요"
              style={textInputStyle}
            />
            <button type="button" style={primaryButtonStyle} onClick={onFail}>
              구독 유지
            </button>
            <button
              type="button"
              style={{ ...tinyLinkStyle, opacity: canProceed ? 1 : 0.3, pointerEvents: canProceed ? "auto" : "none" }}
              onClick={canProceed ? onContinue : undefined}
            >
              구독 취소
            </button>
          </div>
        );
      }
      return (
        <div key="s11-plain" style={stepContainerStyle}>
          <h2 style={titleStyle}>최종 확인</h2>
          <p style={descStyle}>구독을 취소하면 모든 혜택이 즉시 중단됩니다.</p>
          {renderButtons(layout, "구독 유지", "구독 취소", onFail, onContinue)}
        </div>
      );
    })(),
  ];
}

export default function RoachMotelFlowStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showCountdown, setShowCountdown] = useState(false);
  const [dynamicSteps, setDynamicSteps] = useState(params.steps);
  const maxDynamicSteps = Math.ceil(params.steps * 1.5);

  // 각 스텝마다 무작위 풀 인덱스 시퀀스 생성 (최초 1회)
  const POOL_SIZE = 12;
  const [stepSequence, setStepSequence] = useState<number[]>(() => {
    const seq: number[] = [];
    for (let i = 0; i < Math.max(params.steps, 1); i++) {
      seq.push(Math.floor(Math.random() * POOL_SIZE));
    }
    return seq;
  });

  // 각 스텝의 레이아웃 변형도 무작위
  const [layouts, setLayouts] = useState<LayoutVariant[]>(() =>
    Array.from({ length: Math.max(params.steps, 1) }, () => getRandomLayout()),
  );

  // 카운트다운 트리거: 짝수 스텝에서 표시
  useEffect(() => {
    if (currentStepIndex % 3 === 2) {
      setShowCountdown(true);
    }
  }, [currentStepIndex]);

  const handleStaySubscribed = useCallback(() => {
    if (params.wrongCloseAddsLayer && dynamicSteps < maxDynamicSteps) {
      setDynamicSteps((prev) => prev + 1);
      setStepSequence((prev) => [...prev, Math.floor(Math.random() * POOL_SIZE)]);
      setLayouts((prev) => [...prev, getRandomLayout()]);
    }
    if (params.shuffleOnMiss) {
      setLayouts((prev) => {
        const next = [...prev];
        next[currentStepIndex] = getRandomLayout();
        return next;
      });
      setStepSequence((prev) => {
        const next = [...prev];
        for (let i = currentStepIndex; i < next.length; i++) {
          next[i] = Math.floor(Math.random() * POOL_SIZE);
        }
        return next;
      });
    }
    onFail();
  }, [onFail, params.wrongCloseAddsLayer, params.shuffleOnMiss, dynamicSteps, maxDynamicSteps, currentStepIndex]);

  const handleCountdownExpire = useCallback(() => {
    setShowCountdown(false);
    onFail();
  }, [onFail]);

  const handleDismissCountdown = useCallback(() => {
    setShowCountdown(false);
  }, []);

  const handleContinueCancel = useCallback(() => {
    setShowCountdown(false);
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex >= dynamicSteps) {
      onComplete();
    } else {
      setCurrentStepIndex(nextStepIndex);
      setTypedText("");
    }
  }, [currentStepIndex, dynamicSteps, onComplete]);

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedText(e.target.value);
    },
    [],
  );

  const currentLayout = layouts[currentStepIndex] ?? "cancel_bottom";
  const poolIndex = stepSequence[currentStepIndex] ?? 0;

  const allSteps = buildStepPool(
    handleStaySubscribed,
    handleContinueCancel,
    typedText,
    handleTypeChange,
    params.requireTyping && currentStepIndex === dynamicSteps - 1,
    currentLayout,
  );

  const stepNode = allSteps[poolIndex % allSteps.length];

  return (
    <div style={containerStyle}>
      <div style={progressBarContainerStyle}>
        <div
          style={{
            ...progressBarFillStyle,
            width: `${((currentStepIndex + 1) / dynamicSteps) * 100}%`,
          }}
        />
      </div>
      {stepNode}

      {showCountdown && (
        <div style={countdownOverlayStyle}>
          <div style={countdownBoxStyle}>
            <CountdownOverlay onExpire={handleCountdownExpire} />
            <button
              type="button"
              style={{ ...tinyLinkStyle, marginTop: 8, display: "block" }}
              onClick={handleDismissCountdown}
            >
              무시하고 계속 취소
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
  boxSizing: "border-box",
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

const countdownOverlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
};

const countdownBoxStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "24px 32px",
  borderRadius: 16,
  textAlign: "center",
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const fakeProgressBarContainerStyle: React.CSSProperties = {
  width: "100%",
  height: 8,
  backgroundColor: "#e5e7eb",
  borderRadius: 4,
  overflow: "hidden",
};

const fakeProgressBarFillStyle: React.CSSProperties = {
  height: "100%",
  width: "60%",
  backgroundColor: "#3182F6",
  borderRadius: 4,
  animation: "none",
};
