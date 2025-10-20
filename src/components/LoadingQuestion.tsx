import React from "react";
import "../styles.css"; // spinner class 사용하려면 import 유지

export default function LoadingQuestion({ text }: { text: string }) {
  return (
    <div
      style={{
        marginTop: 12,
        textAlign: "center",
        padding: "10px 0",
        fontSize: 14,
        color: "#64748b",
      }}
    >
      <span
        className="spinner"
        style={{
          display: "inline-block",
          width: 16,
          height: 16,
          border: "2px solid #cbd5e1",
          borderTop: "2px solid #4b74ff",
          borderRadius: "50%",
          marginRight: 8,
          verticalAlign: "middle",
          animation: "spin 1s linear infinite",
        }}
      />
      {text}
    </div>
  );
}
