import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  ClipboardList,
  Target,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ZoomIn,
  ArrowLeft,
} from "lucide-react";

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
  highlight?: HighlightBox; // ✅ highlight 좌표 추가
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

  const currentStepData = useMemo(() => {
    return planData.steps[currentStep];
  }, [currentStep, planData]);

  const handleNextStep = () => {
    hideOverlay();
    setCurrentStep((prev) => Math.min(prev + 1, planData.total_steps - 1));
  };

  const handlePrevStep = () => {
    hideOverlay();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // ✅ overlay 표시/숨김 함수 재활용
  const showOverlay = () => {
    const highlight = currentStepData.highlight;
    if (!highlight) return;
    (window as any).overlay?.show({
      boxes: [highlight],
      screenshotPath: "",
    });
  };

  const hideOverlay = () => {
    (window as any).overlay?.hide?.();
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === planData.total_steps - 1;

  const renderDots = () =>
    Array.from({ length: planData.total_steps }, (_, index) => (
      <div
        key={index}
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: index === currentStep ? "#2563eb" : "#dbeafe",
          transition: "background-color 0.3s ease",
        }}
      />
    ));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* 상단 돌아가기 버튼 */}
      <button
        onClick={() => {
          hideOverlay();
          onBack();
        }}
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

      {/* 상단 기능 버튼 */}
      <section
        className="card"
        style={{
          padding: "12px",
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        {/* ✅ Help 버튼 클릭 시 현재 단계 highlight 좌표 표시 */}
        <button style={buttonStyles.help} onClick={showOverlay}>
          <HelpCircle size={14} /> HELP
        </button>

        <button style={buttonStyles.plan}>
          <ClipboardList size={14} /> 전체 계획
        </button>
        <button style={buttonStyles.summary} onClick={onShowSummary}>
          <Target size={14} /> 작업 요약
        </button>
        <button
          style={buttonStyles.complete}
          onClick={() => {
            hideOverlay();
            onComplete();
          }}
        >
          <CheckCircle2 size={14} /> 완료
        </button>
      </section>

      {/* 목표 표시 */}
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
          현재 단계
        </h3>
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
            color: "#111827",
            marginBottom: "20px",
            minHeight: "2.5em",
            lineHeight: 1.4,
          }}
        >
          {currentStepData.action}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={handlePrevStep}
            disabled={isFirstStep}
            style={{ ...navButtonStyle, opacity: isFirstStep ? 0.4 : 1 }}
          >
            <ChevronLeft size={20} />
          </button>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937" }}>
              {currentStep + 1} / {planData.total_steps}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>{renderDots()}</div>
          </div>

          <button
            onClick={handleNextStep}
            disabled={isLastStep}
            style={{ ...navButtonStyle, opacity: isLastStep ? 0.4 : 1 }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* 가이드 */}
      <section className="card" style={{ padding: "20px" }}>
        <h3 style={guideHeaderStyle}>
          <BookOpen size={16} /> 가이드
        </h3>
        <p style={guideBodyStyle}>{currentStepData.guide}</p>
      </section>

      {/* 상세 가이드 */}
      <section className="card" style={{ padding: "20px" }}>
        <h3 style={guideHeaderStyle}>
          <ZoomIn size={16} /> 상세 가이드
        </h3>
        <p style={{ ...guideBodyStyle, whiteSpace: "pre-line", lineHeight: 1.8 }}>
          {currentStepData.detail}
        </p>
      </section>
    </div>
  );
}

// --- 버튼 스타일 공통 ---
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
  plan: { ...baseButtonStyle, backgroundColor: "#eff6ff", borderColor: "#dbeafe", color: "#2563eb" },
  summary: { ...baseButtonStyle, backgroundColor: "#f5f3ff", borderColor: "#e0e7ff", color: "#6d28d9" },
  complete: { ...baseButtonStyle, backgroundColor: "#f0fdf4", borderColor: "#dcfce7", color: "#16a34a" },
};

const navButtonStyle: React.CSSProperties = {
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#374151",
  transition: "all 0.2s ease",
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
