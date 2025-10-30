import React from "react";

interface PurposeInputProps {
  purpose: string; // Main의 purposeInputText가 이 prop으로 전달됨
  setPurpose: (purpose: string) => void; // Main의 setPurposeInputText가 이 prop으로 전달됨
  onSubmit: () => void;
}

const PurposeInput: React.FC<PurposeInputProps> = ({
  purpose,
  setPurpose,
  onSubmit,
}) => {
  return (
    <section className="card" style={{ width: "100%" }}>
      <h3
        style={{
          fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        목표를 설정해주세요:
      </h3>
      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
        <input
          type="text"
          placeholder="예: 정부24 사이트에서 주민등록등본 발급하기"
          value={purpose} // purposeInputText가 여기에 바인딩됨
          onChange={(e) => setPurpose(e.target.value)} // setPurposeInputText가 호출됨
          onKeyDown={(e) => {
            if (e.key === "Enter" && purpose) {
              onSubmit();
            }
          }}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!purpose}
          style={{
            background: purpose ? "#77c8ff" : "#f2f2f2",
            color: purpose ? "#fff" : "#bbb",
            padding: "12px 24px",
            borderRadius: "12px",
            cursor: purpose ? "pointer" : "not-allowed",
            border: "none",
            fontWeight: "600",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          전송
        </button>
      </div>
    </section>
  );
};

export default PurposeInput;

