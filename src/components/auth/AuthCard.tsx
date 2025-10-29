import React, { useState } from "react";
import SignupDialog from "./SignupDialog";  // SignUpDialog를 import
import LoginForm from "./LoginForm";

const AuthCard: React.FC = () => {
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
};

export default AuthCard;
