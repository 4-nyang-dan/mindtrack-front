import React, { useState } from "react";
import Topbar from "../layout/Topbar";

import CaptureControls from "./Suggestion/CaptureControls";
import QuestionInput from "./Suggestion/QuestionInput";
import PurposeInput from "./Purpose/PurposeInput";
import { useAuth } from "./auth/AuthContext";
import { useScreenshot } from "../hooks/useScreenshot";
import { useSuggestions } from "../hooks/useSuggestion";
import AnswerCard from "./Suggestion/AnswerCard";
import LoadingQuestion from "../layout/LoadingQuestion";
import SuggestionReplace from "./Suggestion/SuggestionReplace";
import AuthCard from "./auth/AuthCard";
import ModeSelection from "./Purpose/ModeSelection";
import GoalTracker from "./Goal/GoalTracker";

// AnswerData 인터페이스 정의
interface AnswerData {
  question: string; // 질문
  ai_thoughts: string; // AI 사고 과정
  answer: string; // 답변 내용
}

const Main: React.FC = () => {
  const { user, setUser } = useAuth();
  const { startCapture, stopCapture } = useScreenshot();
  const [capturing, setCapturing] = useState(false);

  const { payload: analysisData } = useSuggestions();
  const [input, setInput] = useState("");
  const [suggestionAnswer, setSuggestionAnswer] = useState<AnswerData | null>(
    null
  );
  const [inputAnswer, setInputAnswer] = useState<AnswerData | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [loadingInput, setLoadingInput] = useState(false);

  // 모드 상태 관리
  const [mode, setMode] = useState<"vulnerable" | "regular" | null>(null);

  // --- (수정) purpose state 분리 ---
  const [purpose, setPurpose] = useState(""); // "확정된" 목표
  const [purposeInputText, setPurposeInputText] = useState(""); // "입력 중인" 목표 텍스트
  // ---------------------------------

  // --- 모달 상태 추가 ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  // ---------------------

  const FASTAPI_BASE = "http://localhost:8000";

  // 공통 fetch 함수
  async function fetchAnswer(question: string, target: "suggestion" | "input") {
    // ... (이전 코드와 동일)
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
    if (loadingInput) return;
    await fetchAnswer(input, "input");
    setInput("");
  };

  // --- (수정) 핸들러 이름 변경: 'Action' 클릭 (모달 띄우기) ---
  const handleActionClick = async (question: string) => {
    if (loadingSuggestion) return;
    handleShowModal(question);
  };
  // ----------------------------------------------------

  // --- (추가) 'Question' 클릭 핸들러 (바로 답변 받기) ---
  const handleSimpleQuestionClick = async (question: string) => {
    if (loadingSuggestion) return;
    await fetchAnswer(question, "suggestion");
  };
  // --------------------------------------------------

  const handleModeSelect = (selectedMode: "vulnerable" | "regular") => {
    setMode(selectedMode);
  };

  const handleLogout = async () => {
    await window.auth.logout();
    setUser(null);
    setMode(null);
  };

  const handlePurposeSubmit = () => {
    // [취약계층 모드] 목적 설정 후 처리 (임시)
    // TODO: 취약계층 모드도 "확정" 로직이 필요하면 handleRegularPurposeSubmit과 유사하게 수정
    alert(`목적이 설정되었습니다: ${purposeInputText}`);
  };

  // --- [일반 모드] 목적 설정 제출 핸들러 (수정) ---
  const handleRegularPurposeSubmit = () => {
    handleShowModal(purposeInputText); // "입력 중인" 텍스트로 모달을 띄움
  };
  // -------------------------------------------

  const handleStartCapture = () => {
    setCapturing(true);
    startCapture();
  };

  const handleStopCapture = () => {
    setCapturing(false);
    stopCapture();
  };

  const handleSummary = () => {
    if (capturing) return;
    alert("📝 요약 기능이 실행됩니다. (임시)");
    console.log("요약 버튼 클릭");
  };

  const handleReset = () => {
    if (capturing) return;
    setSuggestionAnswer(null);
    setInputAnswer(null);
    setPurpose(""); // "확정된" 목표 초기화
    setPurposeInputText(""); // "입력 중인" 텍스트도 초기화
    console.log("초기화 또는 완료 실행");
  };

  // --- 모달 관련 핸들러 ---
  const handleShowModal = (text: string) => {
    if (!text.trim()) return;
    setModalContent(text);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent("");
  };

  // --- (수정) "Yes" 클릭 시 로직 ---
  const handleConfirmModal = () => {
    setPurpose(modalContent); // "확정된" 목표(purpose)를 이때 설정!
    // alert(`'${modalContent}' (이)가 새로운 목표로 설정되었습니다.`); // <-- (수정) 이 줄을 주석 처리!
    console.log("새 목표 설정:", modalContent);
    setPurposeInputText(""); // 입력창 비우기
    handleCloseModal();
  };
  // ---------------------------------

  // ... (모달 스타일 정의는 이전과 동일)
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    padding: "24px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    backgroundColor: "white",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

  const modalButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const modalButtonStyleYes: React.CSSProperties = {
    ...modalButtonStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  const modalButtonStyleNo: React.CSSProperties = {
    ...modalButtonStyle,
    backgroundColor: "#f0f0f0",
    color: "#555",
    border: "1px solid #ccc",
  };
  // ...

  if (!user) {
    return (
      <div className="app-shell">
        <AuthCard />
      </div>
    );
  }

  if (mode === null) {
    return (
      <ModeSelection
        onModeSelect={handleModeSelect}
        onLogout={handleLogout}
        user={{ id: user.userId }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7faff 0%, #edf2f7 100%)",
        overflowX: "auto",
      }}
    >
      <Topbar
        onLogout={handleLogout}
        showBackButton={mode !== null}
        onBack={() => setMode(null)}
      />

      <main
        style={{
          marginTop: "76px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          maxWidth: "520px",
          padding: "0 12px 24px",
          boxSizing: "border-box",
          gap: "16px",
        }}
      >
        {/* --- (수정) 렌더링 로직 --- */}
        {/* "확정된" purpose가 있을 때만 GoalTracker 렌더링 */}
        {mode === "regular" && purpose ? (
          <GoalTracker purpose={purpose} onComplete={handleReset} />
        ) : (
          <>
            {/* 취약계층 모드 (purposeInputText와 setPurposeInputText 사용) */}
            {mode === "vulnerable" && (
              <PurposeInput
                purpose={purposeInputText}
                setPurpose={setPurposeInputText}
                onSubmit={handlePurposeSubmit}
              />
            )}

            {/* 캡처 컨트롤 (공통) */}
            <CaptureControls
              capturing={capturing}
              startCapture={handleStartCapture}
              stopCapture={handleStopCapture}
              onSummary={handleSummary}
              onReset={handleReset}
            />

            {/* 제안 및 목적 설정 (수정: 핸들러 분리 전달) */}
            <SuggestionReplace
              payload={analysisData}
              onActionClick={handleActionClick} // '앞으로...' (모달)
              onQuestionClick={handleSimpleQuestionClick} // '혹시...' (답변)
              mode={mode}
              purpose={purposeInputText}
              setPurpose={setPurposeInputText}
              onPurposeSubmit={handleRegularPurposeSubmit}
            />

            {/* 나머지 기존 UI (공통) */}
            {loadingSuggestion && (
              <LoadingQuestion text="AI가 추천질문에 대한 답변을 준비 중입니다..." />
            )}

            {suggestionAnswer && !loadingSuggestion && (
              <AnswerCard
                title="🧠 추천질문에 대한 AI 답변"
                data={suggestionAnswer}
                color="#eef6ff"
              />
            )}

            <QuestionInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              loading={loadingInput}
            />

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
          </>
        )}
        {/* ---------------------------------- */}
      </main>

      {/* --- 확인 모달 (이전 코드와 동일) --- */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle} className="card">
            <h3
              style={{
                marginTop: 0,
                marginBottom: "24px",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  color: "#007bff",
                  fontWeight: "bold",
                  wordBreak: "break-all",
                }}
              >
                "{modalContent}"
              </span>
              <br />
              (을)를 목표로 설정 하시겠습니까?
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                gap: "16px",
              }}
            >
              <button onClick={handleConfirmModal} style={modalButtonStyleYes}>
                Yes
              </button>
              <button onClick={handleCloseModal} style={modalButtonStyleNo}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;

