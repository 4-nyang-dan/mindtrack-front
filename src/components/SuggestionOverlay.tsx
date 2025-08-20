// 좌상단 투명 오버레이 UI
import React, { useMemo, useState } from "react";
import { useSuggestions } from "../hooks/useSuggestion";
import type { Suggestion } from "../types/suggestion";

export default function SuggestionsOverlay({}) {
  const { payload, error } = useSuggestions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const top3 = useMemo<Suggestion[]>(() => payload?.suggestions?.slice(0, 3) ?? [], [payload]);
  const selected = top3.find(s => s.id === selectedId) || null;

  if (error) return <div style={wrap}>네트워크 오류: {error}</div>;
  if (!payload || top3.length === 0) return <div style={wrap}>분석 결과를 준비 중…</div>;

  return (
    <div style={wrap}>
      <div style={header}>혹시 지금 이걸 고민 중이신가요?</div>

      <div style={pillRow}>
        {top3.map(q => (
          <button
            key={q.id}
            onClick={() => setSelectedId(prev => (prev === q.id ? null : q.id))}
            style={{
              ...pill,
              border: selected?.id === q.id ? "1px solid rgba(255,255,255,0.9)" : "1px solid rgba(255,255,255,0.25)",
              opacity: selected?.id === q.id ? 1 : 0.85,
            }}
            title={q.confidence != null ? `신뢰도 ${(q.confidence * 100) | 0}%` : undefined}
          >
            {q.question}
          </button>
        ))}
      </div>

      {selected ? (
        <div style={answerBox}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{selected.question}</div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{selected.answer}</div>
        </div>
      ) : (
        <div style={hintBox}>질문을 클릭하면 답변이 열립니다.</div>  // 클릭 전 안내
      )}

      <div style={footer}>업데이트: {new Date(payload.createdAt).toLocaleTimeString()}</div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  position: "fixed", top: 10, left: 10, width: 420, padding: 12,
  color: "#fff", borderRadius: 12, background: "rgba(0,0,0,0.35)",
  backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)", fontSize: 13, userSelect: "text", zIndex: 99999
};

const header: React.CSSProperties = { 
  fontWeight: 700, 
  marginBottom: 8, 
  opacity: 0.9 
};
const pillRow: React.CSSProperties = { 
  display: "flex", 
  gap: 8, 
  marginBottom: 8, 
  flexWrap: "wrap" 
};
const pill: React.CSSProperties = { 
  borderRadius: 999, 
  padding: "6px 10px", 
  background: "rgba(255,255,255,0.08)", 
  color: "#fff", 
  cursor: "pointer" 
};
const answerBox: React.CSSProperties = { 
  background: "rgba(255,255,255,0.06)", 
  border: "1px solid rgba(255,255,255,0.15)", 
  borderRadius: 10, 
  padding: 10, 
  maxHeight: 140, 
  overflow: "auto" 
};
const footer: React.CSSProperties = { 
  marginTop: 8, 
  fontSize: 11, 
  opacity: 0.7 
};
const hintBox: React.CSSProperties = { 
  background:"rgba(255,255,255,0.06)", 
  border:"1px dashed rgba(255,255,255,0.25)", 
  borderRadius:10, 
  padding:10, 
  fontSize:12, 
  opacity:.85 };