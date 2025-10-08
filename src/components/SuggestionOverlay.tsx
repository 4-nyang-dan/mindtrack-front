import React, { useEffect, useMemo, useState } from "react";
import { useSuggestions } from "../hooks/useSuggestion";
import type { Suggestion } from "../types/suggestion";

type NormalizedAnswer = {
  text: string;
  isJson: boolean;
  isEmpty: boolean;
};

function normalizeAnswer(raw: unknown): NormalizedAnswer {
  if (raw == null) return { text: "", isJson: false, isEmpty: true };

  let str = "";
  if (typeof raw === "string") {
    str = raw.trim();
  } else {
    try {
      str = JSON.stringify(raw);
    } catch {
      str = String(raw);
    }
  }

  // JSON 형태 파싱
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === "object" && "final_answer" in parsed) {
      const fa = (parsed as any).final_answer;
      if (typeof fa === "string") {
        return { text: fa, isJson: false, isEmpty: fa.trim() === "" };
      }
    }
  } catch {}
  if (!str) return { text: "", isJson: false, isEmpty: true };
  return { text: str, isJson: false, isEmpty: false };
}

export default function SuggestionsOverlay() {
  const { payload, error } = useSuggestions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastTop3, setLastTop3] = useState<Suggestion[] | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const liveTop3 = useMemo<Suggestion[]>(() => payload?.suggestions?.slice(0, 3) ?? [], [payload]);

  useEffect(() => {
    if (liveTop3.length > 0) {
      setLastTop3(liveTop3);
      const ts =
        typeof payload?.createdAt === "number"
          ? payload.createdAt
          : payload?.createdAt
          ? new Date(payload.createdAt as any).getTime()
          : Date.now();
      setLastUpdatedAt(ts);
    }
  }, [liveTop3, payload]);

  const top3: Suggestion[] = liveTop3.length > 0 ? liveTop3 : lastTop3 ?? [];

  useEffect(() => {
    if (selectedId && !top3.some((s) => s.id === selectedId)) setSelectedId(null);
  }, [top3, selectedId]);

  const selected = top3.find((s) => s.id === selectedId) || null;
  useEffect(() => setExpanded(false), [selected?.id]);

  const updatedLabel =
    liveTop3.length > 0 && payload?.createdAt
      ? new Date(payload.createdAt as any).toLocaleTimeString()
      : lastUpdatedAt
      ? new Date(lastUpdatedAt).toLocaleTimeString()
      : "";

  const normalized = normalizeAnswer(selected?.answer);
  const MAX_LEN = 1200;
  const needsClamp = !normalized.isJson && normalized.text.length > MAX_LEN;
  const displayText =
    needsClamp && !expanded
      ? normalized.text.slice(0, MAX_LEN) + " …(더 보기)"
      : normalized.text;

  if (!payload) return <div style={wrap}>분석 결과를 준비 중…</div>;

  // **강조문구 처리**
  const renderWithBold = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, "<b style='color:#fff;font-weight:700'>$1</b>");

  return (
    <div style={wrap}>
      {payload.description && (
        <>
          <div style={header}>현재 상황</div>
          <div style={descBox}>{payload.description}</div>
        </>
      )}

      {payload.predicted_actions && payload.predicted_actions.length > 0 && (
        <>
          <div style={header}>앞으로 이런 일이 일어날 수 있어요</div>
          <ul style={listBox}>
            {payload.predicted_actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      <div style={header}>혹시 지금 이걸 고민 중이신가요?</div>

      {error && <div style={{ ...errorBox, marginBottom: 8 }}>네트워크 오류: {error}</div>}

      <div style={pillRow}>
        {top3.map((q) => (
          <button
            key={q.id}
            onClick={() => setSelectedId((prev) => (prev === q.id ? null : q.id))}
            style={{
              ...pill,
              border:
                selected?.id === q.id
                  ? "1px solid rgba(255,255,255,0.9)"
                  : "1px solid rgba(255,255,255,0.25)",
              opacity: selected?.id === q.id ? 1 : 0.85,
            }}
          >
            {q.question}
          </button>
        ))}
      </div>

      {selected ? (
        <div
          style={{
            ...answerBox,
            fontSize: 13.5,
            lineHeight: 1.7,
            fontFamily: `"system-ui", "Noto Sans KR", sans-serif`,
            color: "#f9fafb",
          }}
          dangerouslySetInnerHTML={{
            __html: normalized.isEmpty
              ? "답변이 비어 있습니다."
              : renderWithBold(displayText),
          }}
        />
      ) : (
        <div style={hintBox}>질문을 클릭하면 답변이 열립니다.</div>
      )}

      <div style={footer}>
        업데이트: {updatedLabel}
        {liveTop3.length === 0 && lastTop3 ? " (이전 결과 유지)" : null}
      </div>
    </div>
  );
}

// 🎨 스타일 세트 (AnswerCard 느낌 맞춤)
const wrap: React.CSSProperties = {
  position: "fixed",
  top: 300,
  left: 10,
  width: 420,
  padding: 14,
  color: "#f1f5f9",
  borderRadius: 12,
  background: "rgba(15,23,42,0.65)", // 딥슬레이트 반투명
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  fontSize: 13.5,
  lineHeight: 1.7,
  fontFamily: `"system-ui", "Noto Sans KR", sans-serif`,
  userSelect: "text",
  zIndex: 99999,
};
const header: React.CSSProperties = {
  fontWeight: 700,
  marginBottom: 8,
  opacity: 0.95,
  fontSize: 14,
};
const descBox: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 10,
  padding: 10,
  marginBottom: 12,
  fontSize: 13.5,
  lineHeight: 1.6,
};
const listBox: React.CSSProperties = {
  marginBottom: 12,
  paddingLeft: 18,
  fontSize: 13.5,
  lineHeight: 1.7,
};
const pillRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 8,
  flexWrap: "wrap",
};
const pill: React.CSSProperties = {
  borderRadius: 999,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.08)",
  color: "#f8fafc",
  cursor: "pointer",
  fontSize: 13,
  fontFamily: `"system-ui", "Noto Sans KR", sans-serif`,
};
const answerBox: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 10,
  padding: 12,
  maxHeight: 180,
  overflow: "auto",
};
const footer: React.CSSProperties = {
  marginTop: 8,
  fontSize: 11.5,
  opacity: 0.7,
};
const hintBox: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px dashed rgba(255,255,255,0.25)",
  borderRadius: 10,
  padding: 10,
  fontSize: 12.5,
  opacity: 0.85,
};
const errorBox: React.CSSProperties = {
  background: "rgba(255,0,0,0.12)",
  border: "1px solid rgba(255,0,0,0.35)",
  borderRadius: 10,
  padding: 10,
  fontSize: 12.5,
};
