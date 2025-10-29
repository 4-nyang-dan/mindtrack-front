import React, { useState } from "react";
import Topbar from "../layout/Topbar";

// import ControlButtons from "./layout/ControlButtons";
import CaptureControls from "./Suggestion/CaptureControls";
import QuestionInput from "./Suggestion/QuestionInput";
import PurposeInput from "./Purpose/PurposeInput"; // 취약계층 모드에서 목적 설정
import { useAuth } from "./auth/AuthContext";
import { useScreenshot } from "../hooks/useScreenshot";
import { useSuggestions } from "../hooks/useSuggestion";
import AnswerCard from "./Suggestion/AnswerCard";
import LoadingQuestion from "../layout/LoadingQuestion";
import SuggestionReplace from "./Suggestion/SuggestionReplace";
import AuthCard from "./auth/AuthCard";
import ModeSelection from "./Purpose/ModeSelection"; // 모드 선택 컴포넌트


// AnswerData 인터페이스 정의
interface AnswerData {
  question: string; // 질문
  ai_thoughts: string; // AI 사고 과정
  answer: string; // 답변 내용
}

const Main: React.FC = () => {
  const { user, setUser, logout } = useAuth();  // user는 { userId, email, token } 형태
  const { startCapture, stopCapture } = useScreenshot();
   const [capturing, setCapturing] = useState(false); // capturing 상태 추가

  const { payload: analysisData, error } = useSuggestions();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionAnswer, setSuggestionAnswer] = useState<AnswerData | null>(null);
  const [inputAnswer, setInputAnswer] = useState<AnswerData | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [loadingInput, setLoadingInput] = useState(false);

  // 모드 상태 관리 
  const [mode, setMode] = useState<"vulnerable" | "regular" | null>(null); 
  const [purpose, setPurpose] = useState("");  // 취약계층 모드에서 목적 입력을 위한 상태

  const FASTAPI_BASE = "http://localhost:8000";


  // 공통 fetch 함수
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

  const handleSend = async () => {
    if (loading) return;
    await fetchAnswer(input, "input");
    setInput("");
  };

  const handleQuestionClick = async (question: string) => {
    if (loading) return;
    await fetchAnswer(question, "suggestion");
  };

  const handleModeSelect = (selectedMode: "vulnerable" | "regular") => {
    setMode(selectedMode);
  };

  const handleLogout = async () => {
    await window.auth.logout();
    setUser(null);
    setMode(null); // 로그아웃 시 모드 초기화
  };


   const handlePurposeSubmit = () => {
    // 목적 설정 후 처리 (예: 캡처 기능 시작)
    alert(`목적이 설정되었습니다: ${purpose}`);
  };

   const handlePurposeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPurpose(e.target.value);
  };

  const handleStartCapture = () => {
    setCapturing(true);
    startCapture();
  };

  const handleStopCapture = () => {
    setCapturing(false);
    stopCapture();
  };

  if (!user) {
    return (
      <div className="app-shell">
        <AuthCard />
      </div>
    );
  }

  if (mode === null) {
    // 모드가 선택되지 않으면 모드 선택 화면을 렌더링
    return <ModeSelection onModeSelect={handleModeSelect}  onLogout={handleLogout}  user={{ id: user.userId }}/>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start", // `center`로 변경하여 상단 배치
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7faff 0%, #edf2f7 100%)",
        overflowX: "auto",
      }}
    >
      {/* Topbar */}
      <Topbar
        onLogout={handleLogout}
      />

      <main
        style={{
          marginTop: "76px", // Topbar 높이를 고려한 여백
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start", // 세로로 시작
          width: "100%",
          maxWidth: "520px",
          padding: "0 12px",
          boxSizing: "border-box",
          gap: "16px",
        }}
      >

        {/* 취약계층 모드에서만 목적 설정 영역 추가 */}
        {mode === "vulnerable" && (
          <PurposeInput
            purpose={purpose}
            setPurpose={setPurpose}
            onSubmit={handlePurposeSubmit}
          />
        )}

        {/* 캡처 관련 화면 */}
        <CaptureControls
          capturing={capturing}
          startCapture={handleStartCapture}
          stopCapture={handleStopCapture}
        />


        {/* SuggestionReplace */}
        <SuggestionReplace
          payload={analysisData}
          onQuestionClick={handleQuestionClick}
        />

        {/* 로딩 상태 */}
        {loadingSuggestion && (
          <LoadingQuestion text="AI가 추천질문에 대한 답변을 준비 중입니다..." />
        )}

        {/* 추천 질문 답변 */}
        {suggestionAnswer && !loadingSuggestion && (
          <AnswerCard
            title="🧠 추천질문에 대한 AI 답변"
            data={suggestionAnswer}
            color="#eef6ff"
          />
        )}

        {/* 질문 입력 */}
        <QuestionInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          loading={loadingInput}
        />

        {/* AI가 답변을 작성 중인 경우 */}
        {loadingInput && (
          <LoadingQuestion text="AI가 답변을 작성 중입니다..." />
        )}

        {/* 직접 입력한 질문에 대한 AI 답변 */}
        {inputAnswer && !loadingInput && (
          <AnswerCard
            title="🧩 직접 입력한 질문에 대한 AI 답변"
            data={inputAnswer}
            color="#f8faff"
          />
        )}
      </main>
    </div>
  );
};

export default Main;
