import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import SignupForm from "./components/auth/SignupForm";
import LoginForm from "./components/auth/LoginForm";
import CaptureControls from "./components/CaptureControls";
import { useScreenshot } from "./hooks/useScreenshot";

/** 회원가입 모달 (Portal) */
function SignupDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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

  const node = (
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
    </div>
  );

  return ReactDOM.createPortal(node, document.body);
}

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
          💡 아직 회원이 아니신가요?
          <button className="link" onClick={() => setOpenSignup(true)}>
            {" "}
            회원가입 해보세요
          </button>
        </p>
      </div>

      <SignupDialog open={openSignup} onClose={() => setOpenSignup(false)} />
    </>
  );
}

function Main() {
  const { user, setUser } = useAuth();
  const { capturing, startCapture, stopCapture } = useScreenshot();

  // 로그인 성공 → 앱 크기 축소
  useEffect(() => {
    if (user) {
      window.appStage?.enterRenderOnly?.();
    } else {
      window.appStage?.exitRenderOnly?.();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="app-shell">
        <AuthCard />
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ alignContent: "start" }}>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo" />
          <div style={{ fontWeight: 800 }}>MindTrack</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="user-chip">
            <span style={{ opacity: 0.75 }}>로그인</span>
            <strong>{user.userId}</strong>
            {user.email && <span style={{ opacity: 0.6 }}>({user.email})</span>}
          </div>
          <button
            className="logout"
            onClick={async () => {
              await window.auth.logout();
              setUser(null); // 로그아웃 → 다시 일반 크기 복귀
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="card" style={{ width: "min(1000px, 94vw)" }}>
        <h2 style={{ marginTop: 0, marginBottom: 14 }}>MindTrack 실행</h2>
        <CaptureControls
          capturing={capturing}
          startCapture={startCapture}
          stopCapture={stopCapture}
        />
      </div>
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
