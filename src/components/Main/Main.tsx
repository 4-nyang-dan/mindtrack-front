import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Topbar from "../../layout/Topbar";
import CaptureControls from "../Suggestion/CaptureControls";
import QuestionInput from "../Suggestion/QuestionInput";
import { useAuth } from "../auth/AuthContext";
import { useScreenshot } from "../../hooks/useScreenshot";
import { useSuggestions } from "../../hooks/useSuggestion";
import AnswerCard from "../Suggestion/AnswerCard";
import LoadingQuestion from "../../layout/LoadingQuestion";
import SuggestionReplace from "../Suggestion/SuggestionReplace";
import AuthCard from "../auth/AuthCard";
import ModeSelection from "../Purpose/ModeSelection";
import GoalTracker from "../Goal/VulnerableGoalTracker";
import NormalGoalTracker from "../Goal/NormalGoalTracker";
import type { PlanData as NormalPlanData } from "../Goal/NormalGoalTracker";
import type { PlanData as VulnerablePlanData } from "../Goal/VulnerableGoalTracker";
import VulnerableModeInput from "../Goal/VulnerableModeInput";
import MainModal from "./MainModal";
import SummaryPanel from "../Summary/SummaryPanel";

// ✅ 각각의 mock 데이터 import
import { mockPlanDataNormal } from "./mock/planDataMock_normal";
import { mockPlanDataVulnerable } from "./mock/planDataMock_vulnerable";

interface AnswerData {
  question: string;
  ai_thoughts: string;
  answer: string;
}

const Main: React.FC = () => {
  const { user, setUser } = useAuth();
  const { startCapture, stopCapture } = useScreenshot();
  const { payload: analysisData } = useSuggestions();

  const [capturing, setCapturing] = useState(false);
  const [input, setInput] = useState("");
  const [suggestionAnswer, setSuggestionAnswer] = useState<AnswerData | null>(null);
  const [inputAnswer, setInputAnswer] = useState<AnswerData | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [loadingInput, setLoadingInput] = useState(false);

  const [mode, setMode] = useState<"vulnerable" | "regular" | null>(null);
  const [purpose, setPurpose] = useState("");
  const [purposeInputText, setPurposeInputText] = useState("");
  const [planData, setPlanData] = useState<NormalPlanData | VulnerablePlanData | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const [showNormalGoalTracker, setShowNormalGoalTracker] = useState(false);
  const [showNormalSummary, setShowNormalSummary] = useState(false);

  const FASTAPI_BASE = "http://localhost:8000";

  // ---------------------- fetch 함수 ----------------------
  async function fetchAnswer(question: string, target: "suggestion" | "input") {
    try {
      if (!question.trim()) return;
      target === "input" ? setLoadingInput(true) : setLoadingSuggestion(true);

      const res = await fetch(`${FASTAPI_BASE}/api/qa/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      target === "suggestion"
        ? setSuggestionAnswer(data)
        : setInputAnswer(data);
    } catch (e) {
      console.error("질문 전송 실패:", e);
    } finally {
      target === "input"
        ? setLoadingInput(false)
        : setLoadingSuggestion(false);
    }
  }

  // ---------------------- 상태 제어 ----------------------
  const handleShowNormalSummary = () => setShowNormalSummary(true);
  const handleBackToGoalTracker = () => setShowNormalSummary(false);

  const handleBackToPurposeInput = () => {
    setShowNormalGoalTracker(false);
    setPurpose("");
    setPurposeInputText("");
    setPlanData(null);
  };

  const handleGoHome = () => {
    // ✅ 전체 상태 초기화 후 ModeSelection으로 이동
    setMode(null);
    setPurpose("");
    setPurposeInputText("");
    setPlanData(null);
    setShowNormalGoalTracker(false);
    setShowNormalSummary(false);
    stopCapture();
    console.log("🏠 처음 화면(ModeSelection)으로 이동");
  };

  // ✅ 모드별로 다른 데이터(mock)로 분기
  const handleConfirmGoal = (goalText: string) => {
    setPurpose(goalText);
    console.log("새 목표 설정:", goalText);

    setIsPlanLoading(true);
    setPlanData(null);

    setTimeout(() => {
      // ✅ 모드별 데이터 분기
      const newPlan =
        mode === "regular"
          ? ({ ...mockPlanDataNormal, goal: goalText } as NormalPlanData)
          : ({ ...mockPlanDataVulnerable, goal: goalText } as VulnerablePlanData);

      setPlanData(newPlan);
      setIsPlanLoading(false);

      if (mode === "regular") {
        setShowNormalGoalTracker(true);
      } else if (mode === "vulnerable") {
        setShowNormalGoalTracker(false);
      }
    }, 1000);

    setPurposeInputText("");
    handleCloseModal();
  };

  const handleConfirmModal = () => handleConfirmGoal(modalContent);

  const handleShowModal = (text: string) => {
    if (!text.trim()) return;
    setModalContent(text);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent("");
  };

  const handleReset = () => {
    setSuggestionAnswer(null);
    setInputAnswer(null);
    setPurpose("");
    setPurposeInputText("");
    setPlanData(null);
  };

  const handleLogout = async () => {
    await window.auth.logout();
    setUser(null);
    setMode(null);
  };

  const handleRegularPurposeSubmit = () => handleShowModal(purposeInputText);
  const handleVulnerableSubmit = (goalText: string) => handleConfirmGoal(goalText);

  const handleModeSelect = (selectedMode: "vulnerable" | "regular") => setMode(selectedMode);

  const handleStartCapture = () => {
    setCapturing(true);
    startCapture();
  };

  const handleStopCapture = () => {
    setCapturing(false);
    stopCapture();
  };

  // ---------------------- 렌더링 로직 ----------------------
  if (!user)
    return (
      <div className="app-shell">
        <AuthCard />
      </div>
    );

  if (mode === null)
    return (
      <ModeSelection
        onModeSelect={handleModeSelect}
        onLogout={handleLogout}
        user={{ id: user.userId }}
      />
    );

  const renderMainContent = () => {
    // ✅ SummaryPanel 표시
    if (showNormalSummary) {
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            onClick={handleBackToGoalTracker}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              color: "#2563eb",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <ArrowLeft size={18} />
            돌아가기
          </button>
          <SummaryPanel />
        </div>
      );
    }

    // ✅ NormalGoalTracker (일반 모드)
    if (showNormalGoalTracker && planData && mode === "regular") {
      return (
        <NormalGoalTracker
          planData={planData as NormalPlanData}
          onComplete={handleReset}
          onBack={handleBackToPurposeInput}
          onShowSummary={handleShowNormalSummary}
        />
      );
    }

    // ✅ GoalTracker (취약계층 모드)
    if (!showNormalGoalTracker && planData && mode === "vulnerable") {
      return <GoalTracker planData={planData as VulnerablePlanData} onComplete={handleReset} />;
    }

    // ✅ 목표 생성 중 로딩 상태
    if (purpose && isPlanLoading) {
      return <LoadingQuestion text="목표에 대한 세부 계획을 생성 중입니다..." />;
    }

    // ✅ 모드별 입력 화면 표시
    if (mode === "vulnerable") {
      return <VulnerableModeInput onSubmitGoal={handleVulnerableSubmit} />;
    }

    if (mode === "regular") {
      return (
        <>
          <CaptureControls
            capturing={capturing}
            startCapture={handleStartCapture}
            stopCapture={handleStopCapture}
            onSummary={() => {}}
            onReset={handleReset}
          />
          <SuggestionReplace
            payload={analysisData}
            onActionClick={handleShowModal}
            onQuestionClick={(q) => fetchAnswer(q, "suggestion")}
            mode={mode}
            purpose={purposeInputText}
            setPurpose={setPurposeInputText}
            onPurposeSubmit={handleRegularPurposeSubmit}
          />
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
            handleSend={() => fetchAnswer(input, "input")}
            loading={loadingInput}
          />
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

    return null;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7faff 0%, #edf2f7 100%)",
      }}
    >
      <Topbar
        onLogout={handleLogout}
        onHome={handleGoHome}
        onBack={handleBackToPurposeInput}
      />

      <main
        style={{
          marginTop: "76px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "520px",
          padding: "0 12px 24px",
          gap: "16px",
        }}
      >
        {renderMainContent()}
      </main>

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
