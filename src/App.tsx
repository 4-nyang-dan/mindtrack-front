import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import SignupForm from "./components/auth/SignupForm";
import LoginForm from "./components/auth/LoginForm";
import { useScreenshot } from "./hooks/useScreenshot";
import { fetchLatestSuggestions } from "./api/suggestion"; // ✅ 파일명 주의!
import type { SuggestionPayload } from "./types/suggestion";

/* 회원가입 모달 */
function SignupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
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
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="회원가입">
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

/* 메인 화면 */
function Main() {
  const { user, setUser } = useAuth();
  const { startCapture, stopCapture } = useScreenshot();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [analysisData, setAnalysisData] = useState<SuggestionPayload | null>(null);

  // ✅ 최신 suggestion 주기적으로 가져오기
  useEffect(() => {
    let timer: any;

    const load = async () => {
      try {
        const data = await fetchLatestSuggestions();
        console.log("✅ 최신 SuggestionPayload:", data);
        if (data) setAnalysisData(data);
      } catch (e) {
        console.error("load error", e);
      }
    };

    load();
    timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await window.api.callJson("/api/suggestions/ask", {
        method: "POST",
        body: { question: text },
      });
      console.log("질문 전송 완료:", res);
      setInput("");
    } catch (e) {
      console.error("질문 전송 실패:", e);
    } finally {
      setSending(false);
    }
  }

  async function handleQuestionClick(question: string) {
    if (!question) return;
    try {
      const res = await fetch("/api/suggestions/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      console.log("AI 응답:", data);
    } catch (e) {
      console.error("질문 전송 실패:", e);
    }
  }

  if (!user) {
    return (
      <div className="app-shell">
        <AuthCard />
      </div>
    );
  }

  // ✅ SuggestionPayload에서 UI로 매핑
  const description = analysisData?.description ?? "분석 중...";
  const actions = analysisData?.predicted_actions ?? [];
  const questions = analysisData?.predicted_questions ?? [];

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
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
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
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
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
                cursor: "pointer",
                color: "#e00",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              ■ 정지
            </button>
          </div>
        </section>

        {/* 사용자 현재 상황 */}
        <section className="card">
          <h3>사용자 현재 상황</h3>
          <p>
            <strong>{description}</strong>
          </p>
        </section>

        {/* 앞으로 이런 일도 할 것인가요? */}
        <section className="card">
          <h3>앞으로 이런 일도 할 것인가요?</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(actions.length > 0 ? actions : Array(3).fill(null)).map((a, i) => (
              <div
                key={i}
                style={{
                  background: a
                    ? "linear-gradient(90deg, #eef7ff 0%, #d7ecff 100%)"
                    : "rgba(230,240,255,0.5)",
                  border: "1px solid rgba(180,200,230,0.5)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  minHeight: 40,
                  color: a ? "#000" : "rgba(0,0,0,0.3)",
                  fontSize: 14,
                  transition: "all 0.4s ease",
                }}
              >
                {a || ""}
              </div>
            ))}
          </div>
        </section>

        {/* 혹시 이런 것이 궁금하신가요? */}
        <section className="card">
          <h3>혹시 이런 것이 궁금하신가요?</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(questions.length > 0 ? questions : Array(3).fill(null)).map((q, i) => (
              <button
                key={i}
                disabled={!q}
                onClick={() => handleQuestionClick(q!)}
                style={{
                  background: q
                    ? "linear-gradient(90deg, #fdfcff 0%, #f1f4ff 100%)"
                    : "rgba(245,245,255,0.6)",
                  border: "1px solid rgba(200,200,230,0.4)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  minHeight: 40,
                  color: q ? "#000" : "rgba(0,0,0,0.3)",
                  fontSize: 14,
                  textAlign: "left",
                  width: "100%",
                  cursor: q ? "pointer" : "default",
                }}
              >
                {q || ""}
              </button>
            ))}
          </div>
        </section>

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
              disabled={!input.trim() || sending}
              style={{
                height: 38,
                padding: "0 14px",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                color: "#fff",
                background: sending ? "#9aa7e0" : "#4b74ff",
                opacity: !input.trim() ? 0.6 : 1,
                cursor: !input.trim() || sending ? "default" : "pointer",
              }}
            >
              {sending ? "전송중..." : "전송"}
            </button>
          </div>
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
