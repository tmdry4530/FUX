import { useState, useCallback, useRef, useMemo } from "react";

export interface WizardFlowParams {
  mode: "endless_wizard" | "government_portal";
  stepCount: number;
  backResets: boolean;
  misleadingLabels: boolean;
  decoyCtas: number;
  forcedScroll: boolean;
  requiredFields: number | string[];
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface WizardFlowStageProps {
  params: WizardFlowParams;
  onComplete: () => void;
  onFail: () => void;
}

function randomStepCount(base: number): number {
  const min = Math.max(4, base - 2);
  const max = base + 3;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FIELD_NAMES = ["이름", "이메일", "전화번호", "주소", "생년월일", "직업", "소속", "사유"];

function normalizeFields(input: number | string[]): string[] {
  if (Array.isArray(input)) return input;
  const count = Math.max(1, Math.min(input, FIELD_NAMES.length));
  return FIELD_NAMES.slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

// 데코이 레이블 풀 - 진짜 "다음"과 매우 유사하게
const DECOY_LABEL_POOL = [
  "다음 단계",
  "계속 진행",
  "다음으로",
  "확인 후 진행",
  "진행하기",
  "이동",
  "저장 후 다음",
  "완료",
];

// misleadingLabels=true 일 때 진짜 버튼에 붙는 혼란 레이블
const MISLEADING_NEXT_LABELS = ["이전으로", "취소", "뒤로", "초기화"];

export default function WizardFlowStage({
  params,
  onComplete,
  onFail,
}: WizardFlowStageProps) {
  const [totalSteps, setTotalSteps] = useState(() => randomStepCount(params.stepCount));
  const maxTotalStepsRef = useRef<number | null>(null);
  if (maxTotalStepsRef.current === null) {
    maxTotalStepsRef.current = Math.ceil(totalSteps * 1.5);
  }
  const maxTotalSteps = maxTotalStepsRef.current;
  const [fields] = useState(() => normalizeFields(params.requiredFields));
  const [currentStep, setCurrentStep] = useState(1);
  const [hasScrolled, setHasScrolled] = useState(!params.forcedScroll);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 각 스텝마다 버튼 순서(셔플) 고정 - 스텝 변경 시 새로 셔플
  const [buttonOrder, setButtonOrder] = useState<number[]>(() => {
    const count = params.decoyCtas + 1; // 데코이 + 진짜 1개
    return shuffle(Array.from({ length: count }, (_, i) => i));
  });

  const reshuffleButtons = useCallback(() => {
    const count = params.decoyCtas + 1;
    setButtonOrder(shuffle(Array.from({ length: count }, (_, i) => i)));
  }, [params.decoyCtas]);

  // 각 데코이에 배정된 레이블 (스텝마다 새로 선택)
  const [decoyLabels, setDecoyLabels] = useState<string[]>(() =>
    Array.from({ length: params.decoyCtas }, (_, i) =>
      DECOY_LABEL_POOL[i % DECOY_LABEL_POOL.length] ?? "확인",
    ),
  );

  const reshuffleDecoyLabels = useCallback(() => {
    const shuffled = shuffle(DECOY_LABEL_POOL);
    setDecoyLabels(
      Array.from({ length: params.decoyCtas }, (_, i) => shuffled[i % shuffled.length] ?? "확인"),
    );
  }, [params.decoyCtas]);

  // misleadingLabels=true 일 때 진짜 버튼 레이블
  const [misleadingNextLabel] = useState<string>(() =>
    MISLEADING_NEXT_LABELS[Math.floor(Math.random() * MISLEADING_NEXT_LABELS.length)] ?? "이전으로",
  );

  const handleScroll = useCallback(() => {
    if (!params.forcedScroll) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrolledToBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    if (scrolledToBottom) {
      setHasScrolled(true);
    }
  }, [params.forcedScroll]);

  const handleNext = useCallback(() => {
    if (!hasScrolled) return;

    const requiredFieldsFilled = fields.every(
      (field) => (fieldValues[field] ?? "").trim().length > 0,
    );
    if (!requiredFieldsFilled) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    if (params.mode === "government_portal" && !agreedToTerms) {
      setShowPopup(true);
      return;
    }

    if (currentStep >= totalSteps) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
      setHasScrolled(!params.forcedScroll);
      setFieldValues({});
      setAgreedToTerms(false);
      reshuffleButtons();
      reshuffleDecoyLabels();
    }
  }, [
    hasScrolled,
    currentStep,
    totalSteps,
    fields,
    params.mode,
    agreedToTerms,
    fieldValues,
    onComplete,
    params.forcedScroll,
    reshuffleButtons,
    reshuffleDecoyLabels,
  ]);

  const handleBack = useCallback(() => {
    if (params.backResets) {
      setCurrentStep(1);
      onFail();
      setFieldValues({});
      setHasScrolled(!params.forcedScroll);
      reshuffleButtons();
      reshuffleDecoyLabels();
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1));
      reshuffleButtons();
      reshuffleDecoyLabels();
    }
  }, [params.backResets, params.forcedScroll, onFail, reshuffleButtons, reshuffleDecoyLabels]);

  const handleDecoy = useCallback(() => {
    onFail();
    // 긴 위저드(>5단계): 2스텝만 되돌림 (전체 초기화 대신 부분 패널티)
    if (totalSteps > 5) {
      setCurrentStep((prev) => Math.max(1, prev - 2));
    } else {
      setCurrentStep(1);
    }
    setFieldValues({});
    setHasScrolled(!params.forcedScroll);
    reshuffleButtons();
    reshuffleDecoyLabels();
    if (params.wrongCloseAddsLayer) {
      setTotalSteps((prev) => Math.min(prev + 1, maxTotalSteps));
    }
  }, [params.forcedScroll, params.wrongCloseAddsLayer, maxTotalSteps, totalSteps, onFail, reshuffleButtons, reshuffleDecoyLabels]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // misleadingLabels=true: 진짜 버튼에 혼란 레이블, 행동은 반대로
  // misleadingLabels=false: 정상 레이블
  const realNextLabel = params.misleadingLabels ? misleadingNextLabel : "다음";
  const realNextAction = params.misleadingLabels ? handleBack : handleNext;

  // 버튼 정의: 인덱스 0 = 진짜 다음, 인덱스 1..N = 데코이
  // 모든 버튼이 동일한 파란색 스타일 (구별 불가)
  const allButtonDefs = useMemo(() => {
    const defs: Array<{ label: string; action: () => void; isReal: boolean }> = [
      { label: realNextLabel, action: realNextAction, isReal: true },
      ...Array.from({ length: params.decoyCtas }, (_, i) => ({
        label: decoyLabels[i] ?? "확인",
        action: handleDecoy,
        isReal: false,
      })),
    ];
    return defs;
  }, [realNextLabel, realNextAction, params.decoyCtas, decoyLabels, handleDecoy]);

  type ButtonDef = { label: string; action: () => void; isReal: boolean };
  const orderedButtons = buttonOrder
    .map((i) => allButtonDefs[i])
    .filter((b): b is ButtonDef => b !== undefined);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: params.mode === "government_portal" ? "#F5F5DC" : "#F9FAFB",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: params.mode === "government_portal" ? "Georgia, 'Times New Roman', serif" : undefined,
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#E5E8EB",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            height: "100%",
            backgroundColor: "#3182F6",
            transition: "width 0.3s",
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E8EB",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#191F28",
            marginBottom: "4px",
          }}
        >
          {params.mode === "government_portal"
            ? "민원 신청서 작성"
            : `${totalSteps}단계 중 ${currentStep}단계`}
        </div>
        <div style={{ fontSize: "14px", color: "#8B95A1" }}>
          {params.mode === "government_portal"
            ? "정보 입력 중... 잠시만 기다려 주세요"
            : "모든 필드를 입력해주세요"}
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            boxShadow:
              params.mode === "government_portal"
                ? "0 4px 8px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)"
                : "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {fields.map((field) => (
            <div key={field} style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#191F28",
                  marginBottom: "8px",
                }}
              >
                {field} <span style={{ color: "#E53935" }}>*</span>
              </label>
              <input
                type="text"
                value={fieldValues[field] ?? ""}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  border: "1px solid #E5E8EB",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          {params.mode === "government_portal" && (
            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                backgroundColor: "#FFF9E6",
                border: "1px solid #FFD700",
                borderRadius: "4px",
              }}
            >
              <label style={{ display: "flex", alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginRight: "8px", marginTop: "2px" }}
                />
                <span style={{ fontSize: "12px", color: "#191F28" }}>
                  개인정보 수집 및 이용에 동의합니다. (필수) 본인은 본 신청서 작성을
                  위해 개인정보가 수집·이용되는 것에 동의하며, 제공된 정보가 사실과
                  다를 경우 법적 책임을 질 수 있음을 확인합니다.
                </span>
              </label>
            </div>
          )}

          {params.forcedScroll && (
            <div style={{ marginTop: "40px", fontSize: "12px", color: "#8B95A1" }}>
              ↓ 스크롤을 내려 모든 내용을 확인해주세요 ↓
              <div style={{ height: "200px" }} />
            </div>
          )}
        </div>
      </div>

      {/* Buttons - 모두 동일한 파란색, 셔플된 순서 */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E5E8EB",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {currentStep > 1 && (
          <button
            type="button"
            onClick={params.misleadingLabels ? handleNext : handleBack}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#4E5968",
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E8EB",
              borderRadius: "4px",
              cursor: "pointer",
              minWidth: "60px",
              minHeight: 44,
            }}
          >
            {params.misleadingLabels ? "다음" : "이전"}
          </button>
        )}

        {orderedButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.isReal && !hasScrolled ? undefined : btn.action}
            disabled={btn.isReal && !hasScrolled}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#FFFFFF",
              // 모든 버튼 동일한 파란색 - 구별 불가능
              backgroundColor:
                btn.isReal && !hasScrolled ? "#E5E8EB" : "#3182F6",
              border: "none",
              borderRadius: "4px",
              cursor: btn.isReal && !hasScrolled ? "not-allowed" : "pointer",
              minWidth: "60px",
              minHeight: 44,
              boxShadow:
                params.mode === "government_portal"
                  ? "0 2px 4px rgba(0,0,0,0.2)"
                  : "none",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Government popup */}
      {showPopup && (
        <div
          style={{
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
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#191F28",
                marginBottom: "12px",
              }}
            >
              필수 동의 항목
            </div>
            <div style={{ fontSize: "14px", color: "#4E5968", marginBottom: "20px" }}>
              개인정보 수집 및 이용에 동의해주셔야 다음 단계로 진행할 수 있습니다.
            </div>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#FFFFFF",
                backgroundColor: "#3182F6",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
