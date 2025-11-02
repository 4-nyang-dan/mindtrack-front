import React, { useState, useMemo, useEffect } from "react";
import {
  HelpCircle,
  ClipboardList,
  Target,
  CheckCircle2,
  BookOpen,
  ZoomIn,
  ArrowLeft,
} from "lucide-react";
import FullPlanPanel from "../Summary/FullPlanPanel";
import QuestionInput from "../Suggestion/QuestionInput";

// ✅ preload.ts에서 노출된 overlay bridge 사용
const overlayBridge = (window as any).overlay;

interface HighlightBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlanStep {
  step: number;
  action: string;
  guide: string;
  detail: string;
  highlight?: HighlightBox;
}

export interface PlanData {
  goal: string;
  total_steps: number;
  steps: PlanStep[];
}

interface NormalGoalTrackerProps {
  planData: PlanData;
  onComplete: () => void;
  onBack: () => void;
  onShowSummary: () => void;
}

export default function NormalGoalTracker({
  planData,
  onComplete,
  onBack,
  onShowSummary,
}: NormalGoalTrackerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFullPlan, setShowFullPlan] = useState(false);
  const [isHelpActive, setIsHelpActive] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); // ✅ 단계 전환 로딩 상태

  const currentStepData = useMemo(() => planData.steps[currentStep], [currentStep, planData]);

  // ✅ HELP 토글
  const toggleHelp = () => {
    if (isHelpActive) {
      overlayBridge.hide();
      setIsHelpActive(false);
    } else {
      const highlight = currentStepData.highlight;
      if (!highlight) {
        alert("이 단계에는 표시할 영역이 없습니다.");
        return;
      }
      overlayBridge.show({ boxes: [highlight], screenshotPath: "" });
      setIsHelpActive(true);
    }
  };

  // ✅ 돌아가기 시 overlay 해제
  const handleBack = () => {
    overlayBridge.hide();
    setIsHelpActive(false);
    onBack();
  };

  // ✅ 전체 계획 보기 — 렌더 중 setState 방지 (순서 수정됨)
  useEffect(() => {
    if (showFullPlan) {
      overlayBridge.hide();
      setIsHelpActive(false);
    }
  }, [showFullPlan]);

  // ✅ 자동 단계 갱신 (HELP 중일 때는 일시정지)
  useEffect(() => {
    if (isHelpActive) return;
    if (currentStep >= planData.total_steps - 1) return;

    const timer = setTimeout(() => {
      setIsTransitioning(true); // 로딩 시작
      setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, planData.total_steps - 1));
        setIsTransitioning(false); // 로딩 종료
      }, 3000); // 로딩 오버레이 3초
    }, 15000); // 15초마다 다음 단계

    return () => clearTimeout(timer);
  }, [currentStep, isHelpActive, planData.total_steps]);

  // ✅ 질문 전송
  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    console.log("사용자 질문:", input);
    await new Promise((r) => setTimeout(r, 1000));
    setInput("");
    setLoading(false);
  };

  // ✅ 로딩 오버레이 표시
  const renderTransitionOverlay = () => {
    if (!isTransitioning) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          color: "white",
          fontSize: 18,
          fontWeight: 600,
          flexDirection: "column",
          transition: "opacity 0.3s ease",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid white",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "16px",
          }}
        />
        <span>로딩 중...</span>
      </div>
    );
  };

  // ✅ ⚠️ return문은 모든 useEffect 아래에 배치해야 함
  if (showFullPlan) {
    return <FullPlanPanel planData={planData} onBack={() => setShowFullPlan(false)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {renderTransitionOverlay()}

      {/* 돌아가기 */}
      <button
        onClick={handleBack}
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

      {/* 상단 버튼 */}
      <section
        className="card"
        style={{
          padding: "12px",
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <button
          style={isHelpActive ? buttonStyles.cancel : buttonStyles.help}
          onClick={toggleHelp}
        >
          <HelpCircle size={14} />
          {isHelpActive ? "취소" : "HELP"}
        </button>

        <button style={buttonStyles.plan} onClick={() => setShowFullPlan(true)}>
          <ClipboardList size={14} /> 전체 계획
        </button>

        <button style={buttonStyles.summary} onClick={onShowSummary}>
          <Target size={14} /> 작업 요약
        </button>

        <button
          style={buttonStyles.complete}
          onClick={() => {
            overlayBridge.hide();
            setIsHelpActive(false);
            onComplete();
          }}
        >
          <CheckCircle2 size={14} /> 완료
        </button>
      </section>

      {/* 목표 */}
      <section
        className="card"
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Target size={18} style={{ color: "#6d28d9" }} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>목표: {planData.goal}</span>
      </section>

      {/* 현재 단계 */}
      <section className="card" style={{ padding: "20px" }}>
        <h3
          style={{
            textAlign: "center",
            fontWeight: "600",
            fontSize: "14px",
            color: "#4b5563",
            marginBottom: "12px",
          }}
        >
          ✅ 현재 단계
        </h3>
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#111827",
            marginBottom: "20px",
            minHeight: "2.5em",
            lineHeight: 1.4,
          }}
        >
          {currentStepData.action}
        </p>
      </section>

      {/* 가이드 */}
      <section className="card" style={{ padding: "20px" }}>
        <h3 style={guideHeaderStyle}>
          <BookOpen size={16} /> 가이드
        </h3>
        <p style={guideBodyStyle}>{currentStepData.guide}</p>
      </section>

      {/* 상세 */}
      <section className="card" style={{ padding: "20px" }}>
        <h3 style={guideHeaderStyle}>
          <ZoomIn size={16} /> 상세 가이드
        </h3>
        <p style={{ ...guideBodyStyle, whiteSpace: "pre-line", lineHeight: 1.8 }}>
          {currentStepData.detail}
        </p>
      </section>

      {/* 질문 입력창 */}
      <QuestionInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        loading={loading}
      />
    </div>
  );
}

// --- 스타일 ---
const baseButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid transparent",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const buttonStyles: Record<string, React.CSSProperties> = {
  help: { ...baseButtonStyle, backgroundColor: "#fff1f2", borderColor: "#ffdde0", color: "#be123c" },
  cancel: { ...baseButtonStyle, backgroundColor: "#fef2f2", borderColor: "#fecaca", color: "#dc2626" },
  plan: { ...baseButtonStyle, backgroundColor: "#eff6ff", borderColor: "#dbeafe", color: "#2563eb" },
  summary: { ...baseButtonStyle, backgroundColor: "#f5f3ff", borderColor: "#e0e7ff", color: "#6d28d9" },
  complete: { ...baseButtonStyle, backgroundColor: "#f0fdf4", borderColor: "#dcfce7", color: "#16a34a" },
};

const guideHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "600",
  fontSize: "15px",
  color: "#111827",
  margin: 0,
  marginBottom: "10px",
};

const guideBodyStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  margin: 0,
  lineHeight: 1.7,
};

const style = document.createElement("style");
style.textContent = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;
document.head.appendChild(style);
