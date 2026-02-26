import { useState, useCallback, useMemo } from "react";
import type React from "react";

export interface TinyButtonParams {
  layout: "topRight" | "center" | "list";
  visualSizePx: number;
  hitSizePx: number;
  decoyCount: number;
  shuffleOnMiss: boolean;
  wrongCloseAddsLayer?: boolean;
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

const DECOY_BG_COLORS = [
  "#1b64da", "#3182F6", "#2563EB", "#1d4ed8", "#4f46e5",
  "#7c3aed", "#0891b2", "#0284c7", "#0369a1", "#1e40af",
];

const MODULE_DEFAULT_DECOYS = [
  "닫기", "취소", "아니오", "나중에", "건너뛰기", "거부",
  "동의 거부", "미동의", "부분 동의", "조건부 동의",
];

interface ButtonItem {
  id: string;
  label: string;
  isTarget: boolean;
  bgColor: string;
}

function buildButtons(params: TinyButtonParams): ButtonItem[] {
  const targetLabel = params.targetLabel ?? "동의";

  // 타겟 라벨과 유사한 데코이를 자동 생성
  const similarDecoys: Record<string, string[]> = {
    "동의": ["동의 거부", "미동의", "부분 동의", "조건부 동의", "동의 취소", "동의 보류"],
    "확인": ["확인 취소", "재확인", "확인 안 함", "나중에 확인", "확인 필요", "부분 확인"],
    "동의합니다": ["동의하지 않습니다", "일부 동의합니다", "조건부로 동의합니다", "동의를 취소합니다"],
    "수락": ["수락 거부", "조건부 수락", "수락 취소", "임시 수락"],
    "허용": ["허용 안 함", "부분 허용", "임시 허용", "허용 취소"],
  };

  const defaultDecoys = [
    "닫기", "취소", "아니오", "나중에", "건너뛰기", "거부",
    "동의 거부", "미동의", "부분 동의", "조건부 동의",
  ];

  const rawDecoys = params.decoyLabels ?? similarDecoys[targetLabel] ?? defaultDecoys;

  const buttons: ButtonItem[] = [
    { id: "target", label: targetLabel, isTarget: true, bgColor: "#f5f5f5" },
  ];

  for (let i = 0; i < params.decoyCount; i++) {
    const colorIdx = i % DECOY_BG_COLORS.length;
    buttons.push({
      id: `decoy-${i}`,
      label: rawDecoys[i % rawDecoys.length]!,
      isTarget: false,
      bgColor: DECOY_BG_COLORS[colorIdx]!,
    });
  }

  return shuffleArray(buttons);
}

// 셔플 시 데코이 색상을 약간 다르게 랜덤화
function rebuildWithColorVariation(params: TinyButtonParams): ButtonItem[] {
  const built = buildButtons(params);
  return built.map((btn) => {
    if (btn.isTarget) return btn;
    const randomColor = DECOY_BG_COLORS[Math.floor(Math.random() * DECOY_BG_COLORS.length)]!;
    return { ...btn, bgColor: randomColor };
  });
}

export default function TinyButtonStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [buttons, setButtons] = useState<ButtonItem[]>(() =>
    buildButtons(params),
  );

  const handlePress = useCallback(
    (item: ButtonItem) => {
      if (item.isTarget) {
        onComplete();
      } else {
        onFail();
        if (params.wrongCloseAddsLayer) {
          setButtons((prev) => {
            const rawDecoys = params.decoyLabels ?? MODULE_DEFAULT_DECOYS;
            const currentDecoyCount = prev.filter((b) => !b.isTarget).length;
            const newDecoys: ButtonItem[] = [0, 1].map((offset) => ({
              id: `decoy-${currentDecoyCount + offset}`,
              label: rawDecoys[(currentDecoyCount + offset) % rawDecoys.length]!,
              isTarget: false,
              bgColor: DECOY_BG_COLORS[Math.floor(Math.random() * DECOY_BG_COLORS.length)]!,
            }));
            return shuffleArray([...prev, ...newDecoys]);
          });
        } else if (params.shuffleOnMiss) {
          setButtons(rebuildWithColorVariation(params));
        }
      }
    },
    [params, onComplete, onFail],
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
          backgroundColor: isTarget ? "#f5f5f5" : item.bgColor,
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
