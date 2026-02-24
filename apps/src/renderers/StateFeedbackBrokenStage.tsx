import { useState, useCallback } from "react";
import type React from "react";

export interface StateFeedbackBrokenParams {
  fields: string[];
  requireStatusCheck: boolean;
}

interface StageRendererProps {
  params: StateFeedbackBrokenParams;
  onComplete: () => void;
  onFail: () => void;
}

export default function StateFeedbackBrokenStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [showStatus, setShowStatus] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const allFilled = params.fields.every((field) => {
      const value = formData[field];
      return value !== undefined && value.trim() !== "";
    });

    if (!allFilled) {
      return;
    }

    const next = submitCount + 1;
    setSubmitCount(next);

    if (!isSubmitted) {
      // First submission - actually submit
      setIsSubmitted(true);
    } else {
      // Duplicate submission
      if (next >= 3) {
        setShowDuplicateWarning(true);
      }
      if (next >= 5) {
        onFail();
        return;
      }
    }

    // NO VISUAL FEEDBACK - this is the bad UX!
  }, [params.fields, formData, isSubmitted, submitCount, onFail]);

  const handleViewStatus = useCallback(() => {
    setShowStatus(true);
    if (isSubmitted && params.requireStatusCheck) {
      onComplete();
    }
  }, [isSubmitted, params.requireStatusCheck, onComplete]);

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>Submit your request</h2>
        <p style={subtitleStyle}>Please fill in all fields and submit</p>

        {params.fields.map((field) => {
          const value = formData[field] ?? "";
          return (
            <div key={field} style={fieldContainerStyle}>
              <label style={labelStyle}>{field}</label>
              <input
                type="text"
                style={inputStyle}
                value={value}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={`Enter ${field.toLowerCase()}`}
              />
            </div>
          );
        })}

        <button
          type="button"
          style={submitButtonStyle}
          onClick={handleSubmit}
        >
          Submit
        </button>

        {showDuplicateWarning && (
          <div style={warningStyle}>
            Multiple submissions detected
          </div>
        )}

        <div style={statusLinkContainerStyle}>
          <button
            type="button"
            style={statusLinkStyle}
            onClick={handleViewStatus}
          >
            View Status
          </button>
        </div>
      </div>

      {showStatus && (
        <div style={statusModalOverlayStyle}>
          <div style={statusModalStyle}>
            <h3 style={statusTitleStyle}>Status</h3>
            {isSubmitted ? (
              <p style={statusTextStyle}>✓ Request received</p>
            ) : (
              <p style={statusTextStyle}>No request submitted yet</p>
            )}
            <button
              type="button"
              style={closeButtonStyle}
              onClick={() => setShowStatus(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  backgroundColor: "#f9fafb",
  padding: "16px",
};

const formContainerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 400,
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: "24px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 8px 0",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#8B95A1",
  margin: "0 0 24px 0",
};

const fieldContainerStyle: React.CSSProperties = {
  marginBottom: "16px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#4E5968",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  border: "1px solid #e5e8eb",
  borderRadius: 6,
  outline: "none",
  transition: "border-color 0.15s",
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "#3182F6",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  marginTop: "8px",
  WebkitTapHighlightColor: "transparent",
};

const warningStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "8px",
  fontSize: 11,
  color: "#ff9800",
  backgroundColor: "#fff3e0",
  borderRadius: 4,
  textAlign: "center",
};

const statusLinkContainerStyle: React.CSSProperties = {
  marginTop: "20px",
  textAlign: "center",
};

const statusLinkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#8B95A1",
  fontSize: 11,
  textDecoration: "underline",
  cursor: "pointer",
  padding: "4px",
  WebkitTapHighlightColor: "transparent",
};

const statusModalOverlayStyle: React.CSSProperties = {
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
};

const statusModalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: "24px",
  width: 280,
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
};

const statusTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#191F28",
  margin: "0 0 16px 0",
};

const statusTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4E5968",
  margin: "0 0 20px 0",
};

const closeButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  fontSize: 14,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "#3182F6",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};
