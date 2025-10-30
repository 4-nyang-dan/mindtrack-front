import React, { useState } from "react"; // useState 임포트
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
  onActionClick,
  mode,
  purpose,
  setPurpose,
  onPurposeSubmit,
}: Props) {
  // --- (추가) 섹션 접기/펴기 상태 ---
  const [sectionsVisible, setSectionsVisible] = useState({
    description: true,
    actions: true,
    questions: true,
  });

  // --- (추가) 섹션 토글 핸들러 ---
  const toggleSection = (section: 'description' | 'actions' | 'questions') => {
    setSectionsVisible(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  // ---------------------------------

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

  // --- (수정) 헤더 버튼 스타일 ---
  const headerStyleBase: React.CSSProperties = {
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
    fontSize: 16,
    fontWeight: 700,
  };
  
  const headerButton: React.CSSProperties = {
    ...headerStyleBase,
    background: "none",
    border: "none",
    color: "inherit", 
    padding: 0,
    cursor: "pointer",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
  };

  const toggleIcon: React.CSSProperties = {
    fontSize: "14px",
    opacity: 0.8,
    width: "20px",
    textAlign: "center",
  };
  
  // --- (추가) 카드 스타일 동적 적용 ---
  // .card의 기본 padding이 16px이라고 가정
  const getCardStyle = (isVisible: boolean): React.CSSProperties => ({
    padding: isVisible ? "16px" : "12px 16px", // (수정) 접혔을 때 위아래 padding을 12px로 줄임
    transition: "padding 0.2s ease-out", // (추가) 부드러운 효과
  });
  // ------------------------------

  return (
    <>
      {/*  --- (수정) 사용자 현재 상황 (접기/펴기) --- */}
      <section 
        className="card" 
        style={getCardStyle(sectionsVisible.description)} // (수정) 동적 스타일 적용
      >
        <button 
          style={{
            ...headerButton,
            marginBottom: sectionsVisible.description ? 10 : 0, 
          }} 
          onClick={() => toggleSection('description')}
        >
          <span>사용자 현재 상황</span>
          <span style={toggleIcon}>{sectionsVisible.description ? '▼' : '►'}</span>
        </button>
        {sectionsVisible.description && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <div style={cardBoxStyle}>{descText}</div>
          </div>
        )}
      </section>

      {/* '일반 모드'일 때 '목표 설정' (이 섹션은 접기/펴기 없음) */}
      {mode === "regular" && (
        <PurposeInput
          purpose={purpose}
          setPurpose={setPurpose}
          onSubmit={onPurposeSubmit}
        />
      )}

      {/*  --- (수정) 앞으로 이런 일도 할 것인가요? (접기/펴기) --- */}
      <section 
        className="card" 
        style={getCardStyle(sectionsVisible.actions)} // (수정) 동적 스타일 적용
      >
        <button 
          style={{
            ...headerButton,
            marginBottom: sectionsVisible.actions ? 10 : 0,
          }} 
          onClick={() => toggleSection('actions')}
        >
          <span>앞으로 이런 일도 할 것인가요?</span>
          <span style={toggleIcon}>{sectionsVisible.actions ? '▼' : '►'}</span>
        </button>
        {sectionsVisible.actions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {(predicted_actions.length > 0
              ? predicted_actions
              : Array(3).fill(null)
            ).map((a: string | null, i: number) => (
              <button
                key={i}
                disabled={!a}
                onClick={() => a && onActionClick?.(a)}
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
        )}
      </section>

      {/*  --- (수정) 혹시 이런 것이 궁금하신가요? (접기/펴기) --- */}
      <section 
        className="card" 
        style={getCardStyle(sectionsVisible.questions)} // (수정) 동적 스타일 적용
      >
        <button 
          style={{
            ...headerButton,
            marginBottom: sectionsVisible.questions ? 10 : 0,
          }} 
          onClick={() => toggleSection('questions')}
        >
          <span>혹시 이런 것이 궁금하신가요?</span>
          <span style={toggleIcon}>{sectionsVisible.questions ? '▼' : '►'}</span>
        </button>
        {sectionsVisible.questions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {(predicted_questions.length > 0
              ? predicted_questions
              : Array(3).fill(null)
            ).map((q: any, i: number) => {
              const text = typeof q === "string" ? q : q?.question;
              return (
                <button
                  key={i}
                  disabled={!text}
                  onClick={() => text && onQuestionClick?.(text)}
                  style={{
                    ...cardBoxStyle,
                    background: text
                      ? "linear-gradient(90deg, #fdfcff 0%, #f1f4ff 100%)"
                      : "rgba(245,245,2S55,0.6)",
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
        )}
      </section>
    </>
  );
}

