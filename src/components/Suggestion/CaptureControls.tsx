import React from "react";

interface Props {
  capturing: boolean;
  startCapture: () => void;
  stopCapture: () => void;
}

export default function CaptureControls({ capturing, startCapture, stopCapture }: Props) {
  return (
    <section className="card" style={{ padding: "16px", width: "100%", maxWidth: "520px", marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        {/* '시작' 버튼 */}
        <button
          onClick={startCapture}
          disabled={capturing}
          style={{
            background: capturing ? "#e9f5ff" : "#77c8ff",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontWeight: "600",
            cursor: capturing ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            color: "#fff",
            boxShadow: capturing ? "none" : "0px 4px 10px rgba(0, 123, 255, 0.2)",
          }}
        >
          ▶ 시작
        </button>
        
        {/* '정지' 버튼 */}
        <button
          onClick={stopCapture}
          disabled={!capturing}
          style={{
            background: capturing ? "#ff5b5b" : "#f2f2f2",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontWeight: "600",
            cursor: capturing ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            color: capturing ? "#fff" : "#bbb",
            boxShadow: capturing ? "0px 4px 10px rgba(255, 91, 91, 0.2)" : "none",
          }}
        >
          ⏹ 정지
        </button>
      </div>
    </section>
  );
}
