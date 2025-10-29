import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import SignupForm from "./SignupForm";

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ open, onClose }) => {
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
};

export default SignupDialog;
