import { useNavigate } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import stages from "../stages/stages.mvp.json";

const difficultyLabel = ["", "Very Easy", "Easy", "Normal", "Hard", "Very Hard"];

export function StageListScreen() {
  const navigate = useNavigate();
  const stageList = stages as StageSpec[];

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        Fuck UX
      </h1>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
        나쁜 UX를 직접 체험하고, 왜 나쁜지 배워보세요.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {stageList.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => navigate(`/stage/${stage.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              background: "#fff",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#aaa",
                minWidth: 28,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>
                {stage.title}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                {stage.objective}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                color: stage.difficulty >= 4 ? "#e53935" : "#666",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {difficultyLabel[stage.difficulty]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
