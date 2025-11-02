import React from "react";

interface Props {
  capturing: boolean;
  startCapture: () => void;
  stopCapture: () => void;
  onSummary: () => void;
  onReset: () => void;
}

export default function CaptureControls({
  capturing,
  startCapture,
  stopCapture,
  onSummary,
  onReset,
}: Props) {
  const commonButtonStyle: React.CSSProperties = {
    border: "none",
    borderRadius: "12px",
    padding: "10px 18px", // padding을 12px 24px -> 10px 18px로 줄임
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // 기본 그림자 유지
    whiteSpace: "nowrap", // 텍스트 줄바꿈 방지
    display: "flex", // 이모티콘과 텍스트 정렬을 위해 flex 사용
    alignItems: "center", // 세로 중앙 정렬
    justifyContent: "center", // 가로 중앙 정렬
    gap: "6px", // 이모티콘과 텍스트 사이 간격
  };

  const primaryActiveStyle: React.CSSProperties = {
    background: "#77c8ff",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0px 4px 10px rgba(0, 123, 255, 0.2)",
  };

  const primaryDisabledStyle: React.CSSProperties = {
    background: "#e9f5ff",
    color: "#bbb",
    cursor: "not-allowed",
    boxShadow: "none",
  };

  const stopActiveStyle: React.CSSProperties = {
    background: "#ff5b5b",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0px 4px 10px rgba(255, 91, 91, 0.2)",
  };

  const stopDisabledStyle: React.CSSProperties = {
    background: "#f2f2f2",
    color: "#bbb",
    cursor: "not-allowed",
    boxShadow: "none",
  };

  const summaryActiveStyle: React.CSSProperties = {
    background: "#e6fffa",
    border: "1px solid #b2f5ea",
    color: "#234e52",
    cursor: "pointer",
  };

  const summaryDisabledStyle: React.CSSProperties = {
    background: "#f2f2f2",
    border: "none",
    color: "#bbb",
    cursor: "not-allowed",
  };

  const resetActiveStyle: React.CSSProperties = {
    background: "#fffbeb",
    border: "1px solid #fefcbf",
    color: "#744210",
    cursor: "pointer",
  };

  const resetDisabledStyle: React.CSSProperties = {
    background: "#f2f2f2",
    border: "none",
    color: "#bbb",
    cursor: "not-allowed",
  };

  return (
    <section className="card" style={{ padding: "16px", width: "100%", maxWidth: "520px", marginTop: "16px" }}>
      {/* gap을 10px -> 12px로 늘림 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        {/* '시작' 버튼 */}
        <button
          onClick={startCapture}
          disabled={capturing}
          style={{
            ...commonButtonStyle,
            ...(capturing ? primaryDisabledStyle : primaryActiveStyle),
          }}
        >
          ▶ 시작
        </button>

        {/* '정지' 버튼 */}
        <button
          onClick={stopCapture}
          disabled={!capturing}
          style={{
            ...commonButtonStyle,
            ...(capturing ? stopActiveStyle : stopDisabledStyle),
          }}
        >
          ⏹ 정지
        </button>

        {/* '초기화' 버튼 */}
        <button
          onClick={onReset}
          disabled={capturing}
          style={{
            ...commonButtonStyle,
            ...(capturing ? resetDisabledStyle : resetActiveStyle),
          }}
        >
          🔄 초기화
        </button>
      </div>
    </section>
  );
}