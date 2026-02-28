import { useState, useCallback, useRef } from "react";
import type React from "react";

export interface LabelAmbiguityParams {
  dialogCount: number;
  includeIcons: boolean;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface StageRendererProps {
  params: LabelAmbiguityParams;
  onComplete: () => void;
  onFail: () => void;
}

interface DialogConfig {
  /** 플레이어에게 보여줄 미션 (예: "계정을 삭제하세요") */
  mission: string;
  question: string;
  correctChoice: "left" | "right";
  leftLabel: string;
  rightLabel: string;
  leftIcon?: string;
  rightIcon?: string;
  leftColor?: string;
  rightColor?: string;
}

const DIALOG_POOL: DialogConfig[] = [
  // 1. 기본 삭제 확인 — 확인(좌,빨강)이 정답
  {
    mission: "계정을 삭제하세요",
    question: "계정을 삭제하시겠습니까?",
    correctChoice: "left",
    leftLabel: "확인",
    rightLabel: "취소",
    leftColor: "#E53935",
    rightColor: "#8B95A1",
  },
  // 2. 저장 — 아이콘이 반대로 붙어 있음(휴지통이 저장 버튼에)
  {
    mission: "변경사항을 저장하세요",
    question: "변경사항을 저장하시겠습니까?",
    correctChoice: "right",
    leftLabel: "저장 안 함",
    rightLabel: "저장",
    leftIcon: "💾",   // 저장처럼 보이지만 '저장 안 함'
    rightIcon: "🗑️",  // 휴지통처럼 보이지만 '저장'
  },
  // 3. 이중 부정 — "네, 계속 받겠습니다"가 올바른 선택(수신 유지)
  {
    mission: "이메일 수신을 유지하세요",
    question: "이메일 수신을 거부하시겠습니까?",
    correctChoice: "left",
    leftLabel: "네, 계속 받겠습니다",
    rightLabel: "아니요, 수신 거부",
    leftColor: "#3182F6",
    rightColor: "#8B95A1",
  },
  // 4. 위험해 보이는 정답 — "해지"가 정답(구독 해지 확인)
  {
    mission: "구독을 해지하세요",
    question: "구독을 해지하시겠습니까?",
    correctChoice: "left",
    leftLabel: "해지",
    rightLabel: "유지",
    leftColor: "#E53935",
    rightColor: "#3182F6",
  },
  // 5. "취소"가 정답 — 삭제 취소(파일 보존)
  {
    mission: "파일을 보존하세요 (삭제하지 마세요)",
    question: "파일을 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다.",
    correctChoice: "right",
    leftLabel: "확인",
    rightLabel: "취소",
    leftColor: "#E53935",
    rightColor: "#8B95A1",
    leftIcon: "✅",
    rightIcon: "⛔",
  },
  // 6. 로그아웃 — "취소" 옆에 로그아웃 아이콘
  {
    mission: "로그아웃하세요",
    question: "로그아웃 하시겠습니까?",
    correctChoice: "left",
    leftLabel: "로그아웃",
    rightLabel: "취소",
    leftIcon: "🚪",
    rightIcon: "🚪",  // 취소 버튼에도 동일한 로그아웃 아이콘
    leftColor: "#8B95A1",
    rightColor: "#3182F6",
  },
  // 7. 자동저장 비활성화 — "비활성화 취소"(= 자동저장 유지)가 정답
  {
    mission: "자동 저장을 유지하세요 (끄지 마세요)",
    question: "자동 저장을 비활성화하시겠습니까?",
    correctChoice: "right",
    leftLabel: "비활성화",
    rightLabel: "비활성화 취소",
    leftColor: "#3182F6",
    rightColor: "#8B95A1",
  },
  // 8. 변경사항 저장 안 하고 나가기 — "머무르기"가 정답
  {
    mission: "페이지에 머물러서 변경사항을 지키세요",
    question: "변경사항이 저장되지 않았습니다.\n나가시겠습니까?",
    correctChoice: "right",
    leftLabel: "나가기",
    rightLabel: "머무르기",
    leftColor: "#E53935",
    rightColor: "#3182F6",
    leftIcon: "🏃",
    rightIcon: "🏠",
  },
  // 9. 되돌리기 — "되돌리기 취소"(변경 유지)가 정답
  {
    mission: "변경사항을 유지하세요 (되돌리지 마세요)",
    question: "이 작업을 되돌리시겠습니까?",
    correctChoice: "right",
    leftLabel: "되돌리기",
    rightLabel: "되돌리기 취소",
    leftColor: "#3182F6",
    rightColor: "#8B95A1",
  },
  // 10. 알림 끄기 — 해석에 따라 혼란, "끄지 않기"가 정답(알림 유지)
  {
    mission: "알림을 유지하세요 (끄지 마세요)",
    question: "알림을 끄시겠습니까?",
    correctChoice: "right",
    leftLabel: "끄기",
    rightLabel: "끄지 않기",
    leftColor: "#E53935",
    rightColor: "#8B95A1",
    leftIcon: "🔕",
    rightIcon: "🔔",
  },
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

export default function LabelAmbiguityStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [dialogs, setDialogs] = useState<DialogConfig[]>(() =>
    pickRandom(DIALOG_POOL, params.dialogCount),
  );
  const initialCountRef = useRef(params.dialogCount);

  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const currentDialog = dialogs[currentDialogIndex];

  const handleChoice = useCallback(
    (choice: "left" | "right") => {
      if (!currentDialog) return;

      if (choice === currentDialog.correctChoice) {
        const nextIndex = currentDialogIndex + 1;
        if (nextIndex >= dialogs.length) {
          onComplete();
        } else {
          setCurrentDialogIndex(nextIndex);
        }
      } else {
        if (params.wrongCloseAddsLayer) {
          const maxCount = Math.floor(initialCountRef.current * 1.5);
          if (dialogs.length < maxCount) {
            const unusedFromPool = DIALOG_POOL.filter(
              (poolItem) => !dialogs.some((d) => d.question === poolItem.question),
            );
            if (unusedFromPool.length > 0) {
              const toAdd = unusedFromPool[Math.floor(Math.random() * unusedFromPool.length)]!;
              setDialogs((prev) => {
                const insertIdx = currentDialogIndex + 1 + Math.floor(Math.random() * (prev.length - currentDialogIndex));
                const next = [...prev];
                next.splice(insertIdx, 0, toAdd);
                return next;
              });
            }
          }
        }
        if (params.shuffleOnMiss) {
          setDialogs((prev) => {
            const updated = [...prev];
            const d = updated[currentDialogIndex];
            if (!d) return prev;
            updated[currentDialogIndex] = {
              ...d,
              leftLabel: d.rightLabel,
              rightLabel: d.leftLabel,
              leftColor: d.rightColor,
              rightColor: d.leftColor,
              leftIcon: d.rightIcon,
              rightIcon: d.leftIcon,
              correctChoice: d.correctChoice === "left" ? "right" : "left",
            };
            return updated;
          });
        }
        onFail();
      }
    },
    [currentDialog, currentDialogIndex, dialogs, params.wrongCloseAddsLayer, params.shuffleOnMiss, onComplete, onFail],
  );

  if (!currentDialog) return null;

  return (
    <div style={containerStyle}>
      {/* 미션 배너 — 플레이어가 무엇을 해야 하는지 명시 */}
      <div style={missionBannerStyle}>
        <span style={missionLabelStyle}>미션</span>
        <span style={missionTextStyle}>{currentDialog.mission}</span>
      </div>

      <div style={overlayStyle}>
        <div style={dialogStyle}>
          <div style={headerStyle}>
            <span style={questionStyle}>{currentDialog.question}</span>
          </div>

          <div style={buttonsContainerStyle}>
            <button
              type="button"
              style={{
                ...buttonStyle,
                backgroundColor: currentDialog.leftColor ?? "#f5f5f5",
                color: currentDialog.leftColor ? "#fff" : "#191F28",
              }}
              onClick={() => handleChoice("left")}
            >
              {params.includeIcons && currentDialog.leftIcon && (
                <span style={iconStyle}>{currentDialog.leftIcon}</span>
              )}
              {currentDialog.leftLabel}
            </button>

            <button
              type="button"
              style={{
                ...buttonStyle,
                backgroundColor: currentDialog.rightColor ?? "#f5f5f5",
                color: currentDialog.rightColor ? "#fff" : "#191F28",
              }}
              onClick={() => handleChoice("right")}
            >
              {params.includeIcons && currentDialog.rightIcon && (
                <span style={iconStyle}>{currentDialog.rightIcon}</span>
              )}
              {currentDialog.rightLabel}
            </button>
          </div>

          <div style={progressStyle}>
            {currentDialogIndex + 1} / {dialogs.length}
          </div>
        </div>
      </div>
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

const missionBannerStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 16px",
  background: "linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)",
};

const missionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "rgba(255,255,255,0.8)",
  background: "rgba(255,255,255,0.2)",
  padding: "2px 8px",
  borderRadius: 4,
  flexShrink: 0,
  letterSpacing: "0.5px",
};

const missionTextStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#fff",
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const dialogStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 360,
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: "24px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "24px",
};

const questionStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#191F28",
  display: "block",
  textAlign: "center",
  whiteSpace: "pre-line",
};

const buttonsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginBottom: "16px",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  fontSize: 15,
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "transform 0.1s",
  WebkitTapHighlightColor: "transparent",
};

const iconStyle: React.CSSProperties = {
  fontSize: 18,
};

const progressStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#8B95A1",
  textAlign: "center",
};
