import { useState, KeyboardEvent } from "react";
import { useAuth } from "../auth/AuthContext";

export default function SignupForm() {
  const { setUser } = useAuth();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!userId || !email || !password) return "아이디/이메일/비밀번호를 입력해주세요.";
    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(userId)) return "아이디 형식이 올바르지 않습니다.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "이메일 형식이 올바르지 않습니다.";
    if (password.length < 8) return "비밀번호는 8자 이상 입력해주세요.";
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setBusy(true);
    setError(null);
    try {
      const r = await window.auth.signup(userId, email, password);
      setUser({ userId: r.userId, email: r.email, token: r.token }); // 가입 후 즉시 로그인 상태
      alert("회원가입 완료!");
    } catch (e: any) {
      setError(e?.message || "회원가입에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="form" style={{ width: 320 }}>
      {/* 아이디 */}
      <div className={`field ${error?.includes("아이디") ? "error" : ""}`}>
        <input
          id="su-id"
          className="input has-icon"
          placeholder=" "
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={onKey}
          autoComplete="username"
          inputMode="text"
        />
        <label htmlFor="su-id" className="floating">아이디</label>
        <div className="help">영문/숫자/._- / 3~20자</div>
      </div>

      {/* 이메일 */}
      <div className={`field ${error?.includes("이메일") ? "error" : ""}`}>
        <input
          id="su-email"
          className="input has-icon"
          placeholder=" "
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKey}
          autoComplete="email"
          inputMode="email"
        />
        <label htmlFor="su-email" className="floating">이메일</label>
        <div className="help">알림/연락용 (중복 허용)</div>
      </div>

      {/* 비밀번호 */}
      <div className={`field ${error?.includes("비밀번호") ? "error" : ""}`}>
        <input
          id="su-pw"
          className="input has-icon"
          placeholder=" "
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKey}
          autoComplete="new-password"
          minLength={8}
        />
        <label htmlFor="su-pw" className="floating">비밀번호 (8자 이상)</label>
        <div className="help">안전을 위해 8자 이상을 권장해요</div>
      </div>

      {error && <div className="help" style={{ color: "var(--danger)" }}>{error}</div>}

      <div className="actions" style={{ justifyContent: "center" }}>
        <button className="btn" disabled={busy} onClick={submit}>
          {busy ? <span className="spinner" /> : "회원가입"}
        </button>
      </div>
    </div>
  );
}
