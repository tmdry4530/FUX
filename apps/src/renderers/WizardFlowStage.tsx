import { useState, useCallback, useRef, useEffect } from "react";

export interface WizardFlowParams {
  mode: "endless_wizard" | "government_portal";
  stepCount: number;
  backResets: boolean;
  misleadingLabels: boolean;
  decoyCtas: number;
  forcedScroll: boolean;
  requiredFields: number | string[];
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

export default function WizardFlowStage({
  params,
  onComplete,
  onFail,
}: WizardFlowStageProps) {
  const [totalSteps] = useState(() => randomStepCount(params.stepCount));
  const [fields] = useState(() => normalizeFields(params.requiredFields));
  const [currentStep, setCurrentStep] = useState(1);
  const [resetCount, setResetCount] = useState(0);
  const [decoyClickCount, setDecoyClickCount] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(!params.forcedScroll);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (resetCount >= 3 || decoyClickCount >= 3) {
      onFail();
    }
  }, [resetCount, decoyClickCount, onFail]);

  const handleNext = useCallback(() => {
    if (!hasScrolled) return;

    const requiredFieldsFilled = fields.every(
      (field) => (fieldValues[field] ?? "").trim().length > 0
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
  ]);

  const handleBack = useCallback(() => {
    if (params.backResets) {
      setCurrentStep(1);
      setResetCount((prev) => prev + 1);
      setFieldValues({});
      setHasScrolled(!params.forcedScroll);
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1));
    }
  }, [params.backResets, params.forcedScroll]);

  const handleDecoy = useCallback(() => {
    setDecoyClickCount((prev) => prev + 1);
    setCurrentStep(1);
    setFieldValues({});
    setHasScrolled(!params.forcedScroll);
  }, [params.forcedScroll]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const nextLabel = params.misleadingLabels ? "이전" : "다음";
  const backLabel = params.misleadingLabels ? "다음" : "이전";
  const actualNext = params.misleadingLabels ? handleBack : handleNext;
  const actualBack = params.misleadingLabels ? handleNext : handleBack;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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

      {/* Buttons */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E5E8EB",
          display: "flex",
          gap: "8px",
        }}
      >
        {currentStep > 1 && (
          <button
            type="button"
            onClick={actualBack}
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
            }}
          >
            {backLabel}
          </button>
        )}

        {Array.from({ length: params.decoyCtas }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={handleDecoy}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#FFFFFF",
              backgroundColor: "#8B95A1",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {["확인", "취소", "건너뛰기", "저장"][idx % 4]}
          </button>
        ))}

        <button
          type="button"
          onClick={actualNext}
          disabled={!hasScrolled}
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#FFFFFF",
            backgroundColor: hasScrolled ? "#3182F6" : "#E5E8EB",
            border: "none",
            borderRadius: "4px",
            cursor: hasScrolled ? "pointer" : "not-allowed",
            boxShadow:
              params.mode === "government_portal"
                ? "0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.1)"
                : "none",
          }}
        >
          {nextLabel}
        </button>
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
              ⚠️ 필수 동의 항목
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
