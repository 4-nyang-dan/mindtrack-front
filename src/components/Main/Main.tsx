import React, { useState } from "react";
import Topbar from "../../layout/Topbar";

import CaptureControls from "../Suggestion/CaptureControls";
import QuestionInput from "../Suggestion/QuestionInput";
import PurposeInput from "../Purpose/PurposeInput";
import { useAuth } from "../auth/AuthContext";
import { useScreenshot } from "../../hooks/useScreenshot";
import { useSuggestions } from "../../hooks/useSuggestion";
import AnswerCard from "../Suggestion/AnswerCard";
import LoadingQuestion from "../../layout/LoadingQuestion";
import SuggestionReplace from "../Suggestion/SuggestionReplace";
import AuthCard from "../auth/AuthCard";
import ModeSelection from "../Purpose/ModeSelection";


import GoalTracker, { PlanData } from "../Goal/GoalTracker"; // (수정) GoalTracker와 PlanData 임포트
import { mockPlanData } from "./mock/planDataMock";
import VulnerableModeInput from "../Goal/VulnerableModeInput"; // (추가) 취약계층 모드 컴포넌트 임포트
import MainModal from "./MainModal";


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
  
  // --- (추가) 세부 계획(JSON) 상태 ---
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
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

  // --- (제거) 기존 handlePurposeSubmit 제거 ---
  // const handlePurposeSubmit = () => { ... };
  // ---------------------------------------

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

  // --- (수정) Reset 함수 ---
  const handleReset = () => {
    if (capturing) return;
    setSuggestionAnswer(null);
    setInputAnswer(null);
    setPurpose(""); // "확정된" 목표 초기화
    setPurposeInputText(""); // "입력 중인" 텍스트도 초기화
    setPlanData(null); // (추가) 세부 계획 데이터도 초기화
    console.log("초기화 또는 완료 실행");
  };
  // -------------------------

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

  // --- (추가) 목표 확정 공통 로직 (시뮬레이션) ---
  const handleConfirmGoal = (goalText: string) => {
    // 1. 확정된 목표 설정 (UI 전환 트리거)
    setPurpose(goalText);
    console.log("새 목표 설정:", goalText);
    
    // 2. API 호출 시뮬레이션 (Mock 데이터 사용)
    setIsPlanLoading(true); // 로딩 시작
    setPlanData(null); // 이전 데이터 초기화
    
    // (임시) 1초 후 Mock 데이터를 기반으로 planData 설정
    setTimeout(() => {
      const newPlan = {
        ...mockPlanData,
        goal: goalText, // 사용자가 입력한 목표로 덮어쓰기
      };
      setPlanData(newPlan); // Plan 데이터 설정
      setIsPlanLoading(false); // 로딩 완료
    }, 1000); // 1초 딜레이 시뮬레이션

    setPurposeInputText(""); // 입력창 비우기
    handleCloseModal(); // (일반 모드) 모달 닫기
  };
  // --------------------------------------------

  // --- (수정) "Yes" 클릭 시 로직 ---
  const handleConfirmModal = () => {
    handleConfirmGoal(modalContent); // 공통 로직 호출
  };
  // ---------------------------------

  // --- (추가) "취약계층 모드" 전송 핸들러 ---
  const handleVulnerableSubmit = (goalText: string) => {
    handleConfirmGoal(goalText); // 공통 로직 호출
  };
  // ---------------------------------------

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

  // --- (추가) 렌더링 로직 분리를 위한 함수 ---
  const renderMainContent = () => {
    // 1. (공통) 목표가 확정되면 (purpose state가 있으면)
    // (mode === "regular" || mode === "vulnerable") && purpose
    if (purpose) {
      return isPlanLoading ? (
        <LoadingQuestion text="목표에 대한 세부 계획을 생성 중입니다..." />
      ) : planData ? (
        <GoalTracker planData={planData} onComplete={handleReset} />
      ) : (
        <LoadingQuestion text="계획을 불러오는 중 오류가 발생했습니다." /> // API 호출 실패 시
      );
    }

    // 2. (추가) '취약계층 모드'이고 목표가 아직 없으면
    if (mode === 'vulnerable') {
      return <VulnerableModeInput onSubmitGoal={handleVulnerableSubmit} />;
    }

    // 3. (기존) '일반 모드'이고 목표가 아직 없으면
    if (mode === 'regular') {
      return (
        <>
          {/* 캡처 컨트롤 (공통) */}
          <CaptureControls
            capturing={capturing}
            startCapture={handleStartCapture}
            stopCapture={handleStopCapture}
            onSummary={handleSummary}
            onReset={handleReset}
          />

          {/* 제안 및 목적 설정 (일반 모드 전용) */}
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
      );
    }
    
    // 혹시 모를 예외 처리
    return null; 
  };
  // ----------------------------------------

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
        {/* --- (수정) 렌더링 로직 호출 --- */}
        {renderMainContent()}
        {/* ---------------------------------- */}
      </main>

      {/* --- 확인 모달 (이전 코드와 동일) --- */}
          <MainModal
            isOpen={isModalOpen}
            content={modalContent}
            onConfirm={handleConfirmModal}
            onClose={handleCloseModal}
        />
        
    </div>
  );
};

export default Main;

