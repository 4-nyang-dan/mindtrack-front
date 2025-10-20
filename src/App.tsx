import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import SignupForm from "./components/auth/SignupForm";
import LoginForm from "./components/auth/LoginForm";
import { useScreenshot } from "./hooks/useScreenshot";
import { useSuggestions } from "./hooks/useSuggestion";
import SuggestionReplace from "./components/SuggestionReplace";
import AnswerCard from "./components/AnswerCard";
import LoadingQuestion from "./components/LoadingQuestion";


/* 회원가입 모달 */
function SignupDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="회원가입"
    >
      <div className="overlay-bg" onClick={onClose} />
      <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="header">
          <div className="logo" />
          <div className="title">회원가입</div>
          <button className="modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>
        <SignupForm />
      </div>
    </div>,
    document.body
  );
}

/* 로그인 카드 */
function AuthCard() {
  const [openSignup, setOpenSignup] = useState(false);
  return (
    <>
      <div className="card auth-card">
        <div className="header">
          <div className="logo" />
          <div className="title">MindTrack</div>
        </div>
        <LoginForm />
        <div className="divider" />
        <p className="helper">
          아직 회원이 아니신가요?
          <button className="link" onClick={() => setOpenSignup(true)}>
            회원가입
          </button>
        </p>
      </div>
      <SignupDialog open={openSignup} onClose={() => setOpenSignup(false)} />
    </>
  );
}

function Main() {
  const { user, setUser } = useAuth();
  const { startCapture, stopCapture } = useScreenshot();
  const { payload: analysisData, error } = useSuggestions(); // ✅ SSE 수신

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  // Main() 내부 상태: 아래로 교체
  const [loading, setLoading] = useState(false); // ✅ 전역 로딩


  //  새 타입 정의
  interface AnswerData {
    question: string;
    ai_thoughts: string;
    answer: string;
  }

  //  답변 상태를 객체형으로 변경
  const [suggestionAnswer, setSuggestionAnswer] = useState<AnswerData | null>(null);
  const [inputAnswer, setInputAnswer] = useState<AnswerData | null>(null);

  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [loadingInput, setLoadingInput] = useState(false);

  const FASTAPI_BASE = "http://localhost:8000";

  //  공통 fetch 함수
  async function fetchAnswer(question: string, target: "suggestion" | "input") {
    try {
      if (!question.trim()) return;

      if (target === "input") setLoadingInput(true);
      else setLoadingSuggestion(true);

      const res = await fetch(`${FASTAPI_BASE}/api/qa/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (target === "suggestion") {
        setSuggestionAnswer(data);
      } else {
        setInputAnswer(data);
      }
    } catch (e) {
      console.error("질문 전송 실패:", e);
      const errObj = {
        question,
        ai_thoughts: "(오류로 인해 사고 과정을 불러올 수 없습니다.)",
        answer: "❌ AI 서버 응답 오류가 발생했습니다.",
      };
      if (target === "suggestion") setSuggestionAnswer(errObj);
      else setInputAnswer(errObj);
    } finally {
      if (target === "input") setLoadingInput(false);
      else setLoadingSuggestion(false);
    }
  }


  // 입력 전송
  async function handleSend() {
    if (loading) return;                   // ✅ 로딩 중 재클릭 방지
    await fetchAnswer(input, "input");
    setInput("");
  }

  // 추천질문 클릭
  // 추천질문 클릭 핸들러도 방어 추가
  async function handleQuestionClick(question: string) {
    if (loading) return;                   // ✅ 로딩 중 재클릭 방지
    await fetchAnswer(question, "suggestion");
  }

  if (!user) {
    return (
      <div className="app-shell">
        <AuthCard />
      </div>
    );
  }



  const MAX_W = 520;
  const TOPBAR_H = 64;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7faff 0%, #edf2f7 100%)",
        overflowX: "auto",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* 상단바 */}
      <div
        style={{
          position: "fixed",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: MAX_W,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.9)",
          borderRadius: 12,
          padding: "10px 16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="logo" />
          <div style={{ fontWeight: 800 }}>MindTrack</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            style={{
              border: "none",
              background: "#f3f3f3",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            ⚙️ 설정
          </button>
          <button
            style={{
              border: "none",
              background: "#ffe5e5",
              color: "#e00",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
            }}
            onClick={async () => {
              await window.auth.logout();
              setUser(null);
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 본문 */}
      <main
        style={{
          width: "100%",
          maxWidth: MAX_W,
          margin: `${TOPBAR_H + 36}px auto 40px`,
          padding: "0 12px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* 실행 제어 */}
        <section className="card" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button
              onClick={startCapture}
              style={{
                background: "#e9f5ff",
                border: "none",
                borderRadius: 12,
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ▶ 실행
            </button>
            <button
              style={{
                background: "#f2f2f2",
                border: "none",
                borderRadius: 12,
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ⟳ 업데이트
            </button>
            <button
              onClick={stopCapture}
              style={{
                background: "#ffe5e5",
                border: "none",
                borderRadius: 12,
                padding: "10px 20px",
                fontWeight: 600,
                color: "#e00",
                cursor: "pointer",
              }}
            >
              ■ 정지
            </button>
          </div>
        </section>

        {/* ✅ SSE로 받은 분석 결과 표시 */}
        <SuggestionReplace payload={analysisData} onQuestionClick={handleQuestionClick} />

        {/* ✅ 추천질문 응답 표시 */}
        {loadingSuggestion && <LoadingQuestion text="AI가 추천질문에 대한 답변을 준비 중입니다..." />}
        {suggestionAnswer && !loadingSuggestion && (
          <AnswerCard
            title="🧠 추천질문에 대한 AI 답변"
            data={suggestionAnswer}
            color="#eef6ff"
          />
        )}

        {/* 질문 입력 */}
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
              disabled={!input.trim() || loading}    // ✅ 전역 로딩 반영
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

          {/* ✅ AI 응답 표시 */}
          {loadingInput && <LoadingQuestion text="AI가 답변을 작성 중입니다..." />}
          {inputAnswer && !loadingInput && (
            <AnswerCard
              title="🧩 직접 입력한 질문에 대한 AI 답변"
              data={inputAnswer}
              color="#f8faff"
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
