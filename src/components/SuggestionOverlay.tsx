// 좌상단 투명 오버레이 UI
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
    try { str = JSON.stringify(raw); } catch { str = String(raw); }
  }

  // 1) JSON 형태면 파싱
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === "object" && "final_answer" in parsed) {
      const fa = (parsed as any).final_answer;
      if (typeof fa === "string") {
        return { text: fa, isJson: false, isEmpty: fa.trim() === "" };
      }
    }
  } catch {
    // JSON 아님 → 그냥 문자열 처리
  }

  // 2) 일반 문자열 처리
  if (!str) return { text: "", isJson: false, isEmpty: true };
  return { text: str, isJson: false, isEmpty: false };
}

export default function SuggestionsOverlay({}) {
  const { payload, error } = useSuggestions();

  // 모든 Hook은 항상 같은 순서/갯수로 호출되게 최상단에 배치
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 캐시
  const [lastTop3, setLastTop3] = useState<Suggestion[] | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  // 접기/펼치기 상태 (항상 호출)
  const [expanded, setExpanded] = useState(false);

  // 최신 top3
  const liveTop3 = useMemo<Suggestion[]>(
    () => payload?.suggestions?.slice(0, 3) ?? [],
    [payload]
  );

  // 캐시에 저장
  useEffect(() => {
    if (liveTop3.length > 0) {
      setLastTop3(liveTop3);
      const ts =
        typeof payload?.createdAt === "number"
          ? (payload!.createdAt as number)
          : payload?.createdAt
          ? new Date(payload.createdAt as any).getTime()
          : Date.now();
      setLastUpdatedAt(ts);
    }
  }, [liveTop3, payload]);

  // 화면에 표시할 top3
  const top3: Suggestion[] = liveTop3.length > 0 ? liveTop3 : lastTop3 ?? [];

  // 선택 유지/해제
  useEffect(() => {
    if (selectedId && !top3.some(s => s.id === selectedId)) {
      setSelectedId(null);
    }
  }, [top3, selectedId]);

  const selected = top3.find(s => s.id === selectedId) || null;

  // 질문 변경 시 접기 초기화 (항상 호출되는 hook)
  useEffect(() => {
    setExpanded(false);
  }, [selected?.id]);

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

  // ⛳ 이제야 조건부 렌더 (모든 훅 호출이 끝난 뒤)
  if (top3.length === 0) {
    return <div style={wrap}>분석 결과를 준비 중…</div>;
  }

  return (
    <div style={wrap}>
      <div style={header}>혹시 지금 이걸 고민 중이신가요?</div>

      {error && (
        <div style={{ ...errorBox, marginBottom: 8 }}>
          네트워크 오류: {error}
        </div>
      )}

      <div style={pillRow}>
        {top3.map(q => (
          <button
            key={q.id}
            onClick={() => setSelectedId(prev => (prev === q.id ? null : q.id))}
            style={{
              ...pill,
              border:
                selected?.id === q.id
                  ? "1px solid rgba(255,255,255,0.9)"
                  : "1px solid rgba(255,255,255,0.25)",
              opacity: selected?.id === q.id ? 1 : 0.85,
            }}
            title={q.confidence != null ? `신뢰도 ${((q.confidence * 100) | 0)}%` : undefined}
          >
            {q.question}
          </button>
        ))}
      </div>

      {selected ? (
        <div
          style={{
            ...answerBox,
            whiteSpace: "pre-wrap", // 줄바꿈 그대로 반영
          }}
        >
          {normalized.isEmpty ? "답변이 비어 있습니다." : normalized.text}
        </div>
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

const wrap: React.CSSProperties = {
  position: "fixed",
  top: 300,
  left: 10,
  width: 420,
  padding: 12,
  color: "#fff",
  borderRadius: 12,
  background: "rgba(0,0,0,0.35)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  fontSize: 13,
  userSelect: "text",
  zIndex: 99999,
};
const header: React.CSSProperties = { fontWeight: 700, marginBottom: 8, opacity: 0.9 };
const pillRow: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" };
const pill: React.CSSProperties = { borderRadius: 999, padding: "6px 10px", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer" };
const answerBox: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 10, maxHeight: 180, overflow: "auto" };
const footer: React.CSSProperties = { marginTop: 8, fontSize: 11, opacity: 0.7 };
const hintBox: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.25)", borderRadius: 10, padding: 10, fontSize: 12, opacity: 0.85 };
const errorBox: React.CSSProperties = { background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.35)", borderRadius: 10, padding: 10, fontSize: 12 };
