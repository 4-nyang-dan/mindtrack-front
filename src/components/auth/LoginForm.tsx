import { useState, KeyboardEvent } from "react";
import { useAuth } from "../auth/AuthContext";

export default function LoginForm() {
  const { setUser } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!userId || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await window.auth.login(userId, password);
      setUser({ userId: r.userId, email: r.email, token: r.token });
    } catch (e: any) {
      setError(e?.message || "로그인에 실패했습니다.");
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
      <div className={`field ${error ? "" : ""}`}>
        <input
          id="login-id"
          className="input has-icon"
          placeholder=" "
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={onKey}
          autoComplete="username"
          inputMode="text"
        />
        <label htmlFor="login-id" className="floating">아이디</label>
        <div className="help">영문/숫자/._- 조합 권장</div>
      </div>

      {/* 비밀번호 */}
      <div className={`field ${error ? "error" : ""}`}>
        <input
          id="login-pw"
          type="password"
          className="input has-icon"
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKey}
          autoComplete="current-password"
        />
        <label htmlFor="login-pw" className="floating">비밀번호</label>
        <div className="help">{error ?? "최소 8자 이상을 권장해요"}</div>
      </div>

      <div className="actions" style={{ justifyContent: "center" }}>
        <button className="btn" disabled={busy} onClick={submit}>
          {busy ? <span className="spinner" /> : "로그인"}
        </button>
      </div>
    </div>
  );
}
