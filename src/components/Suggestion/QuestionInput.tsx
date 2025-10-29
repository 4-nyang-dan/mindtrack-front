// components/QuestionInput.tsx
import React from "react";

interface QuestionInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSend: () => void;
  loading: boolean;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ input, setInput, handleSend, loading }) => {
  return (
    <section className="card">
      <h3>궁금한 점이 있으면 물어보세요</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="무엇이든 물어보세요..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 14,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            height: 38,
            padding: "0 14px",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            color: "#fff",
            background: loading ? "#9aa7e0" : "#4b74ff",
            opacity: !input.trim() ? 0.6 : 1,
            cursor: !input.trim() || loading ? "default" : "pointer",
          }}
        >
          {loading ? "전송중..." : "전송"}
        </button>
      </div>
    </section>
  );
};

export default QuestionInput;
