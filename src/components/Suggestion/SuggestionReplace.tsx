import React from "react";
import type { SuggestionPayload } from "../../types/suggestion";
import PurposeInput from "../Purpose/PurposeInput";

interface Props {
  payload: SuggestionPayload | null;
  onQuestionClick?: (q: string) => void; // '혹시...' (답변)
  onActionClick?: (q: string) => void; // '앞으로...' (모달)
  mode: "vulnerable" | "regular" | null;
  purpose: string;
  setPurpose: (p: string) => void;
  onPurposeSubmit: () => void;
}

export default function SuggestionReplace({
  payload,
  onQuestionClick,
  onActionClick, // (추가)
  mode,
  purpose,
  setPurpose,
  onPurposeSubmit,
}: Props) {
  const suggestion = (payload as any)?.suggestion || {};
  const {
    description = "분석 중...",
    predicted_actions = [],
  } = suggestion;
  const predicted_questions = payload?.predicted_questions || [];

  //  description JSON 문자열일 수도 있음
  let descText = description;
  try {
    const parsed = JSON.parse(description);
    if (parsed.current_action) descText = parsed.current_action;
  } catch {}

  //  공통 스타일
  const cardBoxStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #f9fbff 0%, #f2f6ff 100%)",
    border: "1px solid rgba(190,200,230,0.4)",
    borderRadius: 10,
    padding: "12px 14px",
    minHeight: 40,
    fontSize: 14,
    lineHeight: 1.8,
    color: "#222",
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
    whiteSpace: "pre-line",
    transition: "all 0.3s ease",
  };

  return (
    <>
      {/*  사용자 현재 상황 */}
      <section className="card">
        <h3
          style={{
            fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          사용자 현재 상황
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={cardBoxStyle}>{descText}</div>
        </div>
      </section>

      {/* '일반 모드'일 때 '목표 설정' */}
      {mode === "regular" && (
        <PurposeInput
          purpose={purpose}
          setPurpose={setPurpose}
          onSubmit={onPurposeSubmit}
        />
      )}

      {/*  앞으로 이런 일도 할 것인가요? */}
      <section className="card">
        <h3
          style={{
            fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          앞으로 이런 일도 할 것인가요?
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(predicted_actions.length > 0
            ? predicted_actions
            : Array(3).fill(null)
          ).map((a: string | null, i: number) => (
            <button
              key={i}
              disabled={!a}
              onClick={() => a && onActionClick?.(a)} // (수정) onActionClick 사용
              style={{
                ...cardBoxStyle,
                background: a
                  ? "linear-gradient(90deg, #eef7ff 0%, #d7ecff 100%)"
                  : "rgba(230,240,255,0.5)",
                color: a ? "#000" : "rgba(0,0,0,0.3)",
                cursor: a ? "pointer" : "default",
                textAlign: "left",
                fontWeight: 500,
                width: "100%",
              }}
            >
              {a || ""}
            </button>
          ))}
        </div>
      </section>

      {/*  혹시 이런 것이 궁금하신가요? */}
      <section className="card">
        <h3
          style={{
            fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          혹시 이런 것이 궁금하신가요?
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(predicted_questions.length > 0
            ? predicted_questions
            : Array(3).fill(null)
          ).map((q: any, i: number) => {
            const text = typeof q === "string" ? q : q?.question;
            return (
              <button
                key={i}
                disabled={!text}
                onClick={() => text && onQuestionClick?.(text)} // (유지) onQuestionClick 사용
                style={{
                  ...cardBoxStyle,
                  background: text
                    ? "linear-gradient(90deg, #fdfcff 0%, #f1f4ff 100%)"
                    : "rgba(245,245,255,0.6)",
                  border: "1px solid rgba(200,200,230,0.4)",
                  cursor: text ? "pointer" : "default",
                  textAlign: "left",
                  fontWeight: 500,
                  color: text ? "#111" : "rgba(0,0,0,0.3)",
                  transition: "background 0.3s ease",
                }}
              >
                {text || ""}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

