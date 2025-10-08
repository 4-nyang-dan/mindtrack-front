import React from "react";

interface AnswerData {
  question: string;
  ai_thoughts: string;
  answer: string;
}

interface AnswerCardProps {
  title: string;
  data: AnswerData;
  color?: string;
}

export default function AnswerCard({
  title,
  data,
  color = "#f8faff",
}: AnswerCardProps) {
  /** 🔹 사고과정용 정리 함수 */
    const formatThoughtLine = (line: string) => {
    if (!line) return "";

    let clean = line
        .replace(/\\n/g, "\n")
        .replace(/(?:\\\*\\\*|\*\*)/g, "") // 모든 ** 제거
        .replace(/^(\d+)\.\s*\1\.?/, "$1.") // "1. 1." → "1."
        .trim();

    // 번호 + 소제목 + 내용 구분
    const match = clean.match(/^(\d+)\.\s*(.*)$/);
    if (match) {
        const [, num, rest] = match;
        // 만약 rest 안에 ":", "." 뒤에 이어지는 문장이 없으면 그냥 그대로 표시
        if (rest.includes(":")) {
        const [heading, tail] = rest.split(":");
        return `<b>${num}. ${heading.trim()}:</b> ${tail.trim()}`;
        }
        // 일반 문장인 경우 ":"를 붙이지 않음
        return `<b>${num}.</b> ${rest.trim()}`;
    }

    // 일반 문장 (번호 없는 줄)
    return clean;
    };

  /** 🔹 사고과정 줄 배열 */
  const formattedThoughts = (data.ai_thoughts || "")
    .replace(/\\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  /** 🔹 최종 답변 포맷팅 (문단, 리스트, 강조 유지) */
    const renderFormattedAnswer = (text: string) => {
    if (!text) return "답변이 비어 있습니다.";

    const html = text
        .replace(/\\n/g, "\n")
        // **강조** 처리
        .replace(/(?:\\\*\\\*|\*\*)(.+?)(?:\\\*\\\*|\*\*)/g, "<b>$1</b>")
        // - 목록 기호 변환
        .replace(/^- /gm, "• ")
        //  (1)(2)(3) 앞에 강제 줄바꿈 추가 (1~2자리 숫자만)
        .replace(/ ?\((\d{1,2})\)/g, "\n($1)")
        //  숫자목록 여백 확보
        .replace(/\n(\d+\))/g, "\n\n$1")
        //  줄바꿈을 <br>로 변환
        .replace(/\n/g, "<br />");

    return html
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map(
        (block) =>
            `<p style="margin:0 0 8px 0; line-height:1.8;">${block}</p>`
        )
        .join("");
    };

  return (
    <div
      style={{
        marginTop: 16,
        padding: "18px 20px",
        background: color,
        borderRadius: 14,
        border: "1px solid rgba(180,190,220,0.4)",
        lineHeight: 1.7,
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s ease",
      }}
    >
      {/* 제목 */}
      <h4
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontSize: 17,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {title}
      </h4>

      {/* 질문 */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "10px 12px",
          marginBottom: 12,
          fontSize: 14,
          color: "#475569",
          lineHeight: 1.7,
        }}
      >
        <b style={{ color: "#334155" }}>질문:</b>
        <div style={{ marginTop: 4 }}>
          {data.question || "(질문이 없습니다.)"}
        </div>
      </div>

      {/* AI 사고 과정 */}
      <div style={{ marginBottom: 14 }}>
        <b style={{ color: "#334155" }}>🧾 AI의 사고 과정</b>
        <div
          style={{
            background: "#f9fbff",
            border: "1px solid #e0e7ff",
            borderRadius: 8,
            padding: "10px 14px",
            marginTop: 6,
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.8,
          }}
        >
          {formattedThoughts.length > 0 ? (
            formattedThoughts.map((line, idx) => (
              <div
                key={idx}
                style={{ marginBottom: 6 }}
                dangerouslySetInnerHTML={{
                  __html: formatThoughtLine(line),
                }}
              />
            ))
          ) : (
            <div>(AI의 세부 사고 단계가 제공되지 않았습니다.)</div>
          )}
        </div>
      </div>

      {/* 최종 답변 */}
      <div>
        <b style={{ color: "#1e293b" }}>💡 답변</b>
        <div
          style={{
            marginTop: 8,
            padding: "10px 14px",
            background: "#f9fbff",
            border: "1px solid #e0e7ff",
            borderRadius: 8,
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.8,
          }}
          dangerouslySetInnerHTML={{
            __html: renderFormattedAnswer(data.answer || ""),
          }}
        />
      </div>
    </div>
  );
}
