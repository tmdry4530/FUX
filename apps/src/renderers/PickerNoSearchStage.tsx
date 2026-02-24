import { useState, useCallback } from "react";
import type React from "react";

export interface PickerNoSearchParams {
  items: string[];
  targetIndex: number;
  category: string;
}

interface StageRendererProps {
  params: PickerNoSearchParams;
  onComplete: () => void;
  onFail: () => void;
}

export default function PickerNoSearchStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [failCount, setFailCount] = useState(0);
  const targetItem = params.items[params.targetIndex];

  const handleItemClick = useCallback(
    (index: number) => {
      if (index === params.targetIndex) {
        onComplete();
      } else {
        const next = failCount + 1;
        setFailCount(next);
        if (next >= 3) {
          onFail();
        }
      }
    },
    [params.targetIndex, failCount, onComplete, onFail],
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Select your {params.category}</h2>
        <div style={objectiveStyle}>
          Find and select: <strong>{targetItem}</strong>
        </div>
      </div>

      <div style={pickerContainerStyle}>
        {params.items.map((item, index) => {
          const isTarget = index === params.targetIndex;
          return (
            <button
              key={index}
              type="button"
              style={{
                ...itemStyle,
                backgroundColor: isTarget ? "#f0f4ff" : "#fff",
              }}
              onClick={() => handleItemClick(index)}
            >
              <span style={itemTextStyle}>{item}</span>
            </button>
          );
        })}
      </div>

      {failCount > 0 && (
        <div style={errorStyle}>
          Wrong selection! ({failCount}/3 attempts)
        </div>
      )}
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  backgroundColor: "#f9fafb",
  padding: "16px",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "16px",
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 8px 0",
};

const objectiveStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4E5968",
  padding: "12px",
  backgroundColor: "#fff3cd",
  borderRadius: 8,
  border: "1px solid #ffc107",
};

const pickerContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  border: "1px solid #e5e8eb",
  borderRadius: 8,
  backgroundColor: "#fff",
};

const itemStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  border: "none",
  borderBottom: "1px solid #e5e8eb",
  textAlign: "left",
  cursor: "pointer",
  transition: "background-color 0.15s",
  WebkitTapHighlightColor: "transparent",
};

const itemTextStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#191F28",
  fontWeight: 400,
};

const errorStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "10px",
  backgroundColor: "#ffebee",
  color: "#E53935",
  borderRadius: 6,
  fontSize: 13,
  textAlign: "center",
  fontWeight: 600,
};
