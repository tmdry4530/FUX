import { useState, useCallback } from "react";
import type React from "react";

export interface LabelAmbiguityParams {
  dialogCount: number;
  includeIcons: boolean;
}

interface StageRendererProps {
  params: LabelAmbiguityParams;
  onComplete: () => void;
  onFail: () => void;
}

interface DialogConfig {
  question: string;
  correctChoice: "left" | "right";
  leftLabel: string;
  rightLabel: string;
  leftIcon?: string;
  rightIcon?: string;
  leftColor?: string;
  rightColor?: string;
}

const DIALOGS: DialogConfig[] = [
  {
    question: "Delete your account?",
    correctChoice: "left",
    leftLabel: "OK",
    rightLabel: "Cancel",
    leftColor: "#E53935",
    rightColor: "#8B95A1",
  },
  {
    question: "Save changes?",
    correctChoice: "right",
    leftLabel: "Don't Save",
    rightLabel: "Save",
    leftIcon: "💾",
    rightIcon: "🗑️",
  },
  {
    question: "Unsubscribe from emails?",
    correctChoice: "left",
    leftLabel: "Yes, keep sending",
    rightLabel: "No, unsubscribe",
  },
];

export default function LabelAmbiguityStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const dialogsToShow = DIALOGS.slice(0, Math.min(params.dialogCount, DIALOGS.length));
  const currentDialog = dialogsToShow[currentDialogIndex];

  const handleChoice = useCallback(
    (choice: "left" | "right") => {
      if (!currentDialog) return;

      if (choice === currentDialog.correctChoice) {
        // Correct choice
        const nextIndex = currentDialogIndex + 1;
        if (nextIndex >= dialogsToShow.length) {
          onComplete();
        } else {
          setCurrentDialogIndex(nextIndex);
        }
      } else {
        // Wrong choice
        const next = wrongCount + 1;
        setWrongCount(next);
        if (next >= 2) {
          onFail();
        }
      }
    },
    [currentDialog, currentDialogIndex, dialogsToShow.length, wrongCount, onComplete, onFail],
  );

  if (!currentDialog) return null;

  return (
    <div style={containerStyle}>
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
            Dialog {currentDialogIndex + 1} of {dialogsToShow.length}
            {wrongCount > 0 && (
              <span style={errorCountStyle}> • {wrongCount}/2 errors</span>
            )}
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

const errorCountStyle: React.CSSProperties = {
  color: "#E53935",
  fontWeight: 600,
};
