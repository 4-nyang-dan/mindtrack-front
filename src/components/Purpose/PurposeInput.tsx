// components/PurposeInput.tsx
import React from "react";

interface PurposeInputProps {
  purpose: string;
  setPurpose: (purpose: string) => void;
  onSubmit: () => void;
}

const PurposeInput: React.FC<PurposeInputProps> = ({ purpose, setPurpose, onSubmit }) => {
  return (
    <div style={{ marginTop: "20px", width: "100%", textAlign: "center" }}>
      <h3>목적을 설정해주세요:</h3>
      <input
        type="text"
        placeholder="목적을 입력하세요..."
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      />
      <button
        onClick={onSubmit}
        disabled={!purpose}
        style={{
          background: "#77c8ff",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "12px",
          cursor: purpose ? "pointer" : "not-allowed",
          border: "none",
          fontWeight: "600",
        }}
      >
        설정 완료
      </button>
    </div>
  );
};

export default PurposeInput;
