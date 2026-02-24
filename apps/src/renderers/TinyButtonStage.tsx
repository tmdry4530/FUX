import { useState, useCallback, useMemo } from "react";
import type React from "react";

export interface TinyButtonParams {
  layout: "topRight" | "center" | "list";
  visualSizePx: number;
  hitSizePx: number;
  decoyCount: number;
  shuffleOnMiss: boolean;
  decoyLabels?: string[];
  targetLabel?: string;
}

interface StageRendererProps {
  params: TinyButtonParams;
  onComplete: () => void;
  onFail: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

interface ButtonItem {
  id: string;
  label: string;
  isTarget: boolean;
}

function buildButtons(params: TinyButtonParams): ButtonItem[] {
  const defaultDecoys = ["닫기", "취소", "아니오", "나중에", "건너뛰기", "거부"];
  const decoyLabels = params.decoyLabels ?? defaultDecoys;
  const targetLabel = params.targetLabel ?? "동의";

  const buttons: ButtonItem[] = [
    { id: "target", label: targetLabel, isTarget: true },
  ];

  for (let i = 0; i < params.decoyCount; i++) {
    buttons.push({
      id: `decoy-${i}`,
      label: decoyLabels[i % decoyLabels.length]!,
      isTarget: false,
    });
  }

  return shuffleArray(buttons);
}

export default function TinyButtonStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [buttons, setButtons] = useState<ButtonItem[]>(() =>
    buildButtons(params),
  );
  const [missCount, setMissCount] = useState(0);

  const handlePress = useCallback(
    (item: ButtonItem) => {
      if (item.isTarget) {
        onComplete();
      } else {
        const next = missCount + 1;
        setMissCount(next);

        if (next >= 3) {
          onFail();
          return;
        }

        if (params.shuffleOnMiss) {
          setButtons(buildButtons(params));
        }
      }
    },
    [missCount, params, onComplete, onFail],
  );

  const layoutStyle = useMemo((): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      gap: "8px",
      padding: "16px",
    };

    switch (params.layout) {
      case "topRight":
        return {
          ...base,
          flexWrap: "wrap",
          justifyContent: "flex-end",
          alignItems: "flex-start",
        };
      case "center":
        return {
          ...base,
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        };
      case "list":
        return {
          ...base,
          flexDirection: "column",
          alignItems: "stretch",
        };
    }
  }, [params.layout]);

  return (
    <div style={layoutStyle}>
      {buttons.map((item) => {
        const isTarget = item.isTarget;
        const visualSize = isTarget ? params.visualSizePx : 44;
        const hitSize = isTarget ? params.hitSizePx : 44;

        const buttonStyle: React.CSSProperties = {
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: params.layout === "list" ? "100%" : hitSize,
          height: params.layout === "list" ? 48 : hitSize,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        };

        const labelStyle: React.CSSProperties = {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: isTarget ? visualSize : undefined,
          height: isTarget ? visualSize : undefined,
          padding: isTarget ? "2px 4px" : "8px 16px",
          fontSize: isTarget ? Math.max(10, visualSize * 0.5) : 14,
          lineHeight: 1,
          borderRadius: 8,
          backgroundColor: isTarget ? "#f5f5f5" : "#1b64da",
          color: isTarget ? "#999" : "#fff",
          fontWeight: isTarget ? 400 : 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        };

        return (
          <button
            key={item.id}
            type="button"
            style={buttonStyle}
            onClick={() => handlePress(item)}
          >
            <span style={labelStyle}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
