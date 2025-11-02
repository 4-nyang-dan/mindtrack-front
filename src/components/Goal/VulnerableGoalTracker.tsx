import React, { useState, useMemo, useEffect } from "react";
import {
  ClipboardList,
  Target,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import FullPlanPanel from "../Summary/FullPlanPanel";
import { mockPlanDataNormal } from "../Main/mock/planDataMock_normal"; // ✅ 모의 데이터 import

interface HighlightBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlanStep {
  step: number;
  guide: string;
  highlight: HighlightBox;
}

export interface PlanData {
  goal: string;
  total_steps: number;
  steps: PlanStep[];
}

interface GoalTrackerProps {
  planData: PlanData;
  onComplete: () => void;
}

export default function GoalTracker({ planData, onComplete }: GoalTrackerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullPlan, setShowFullPlan] = useState(false);

  const currentStepData = useMemo(() => planData.steps[currentStep], [currentStep, planData]);

  const showOverlayForStep = () => {
    const highlight = currentStepData.highlight;
    if (!highlight) return;
    (window as any).overlay?.show({ boxes: [highlight], screenshotPath: "" });
  };

  const hideOverlay = () => (window as any).overlay?.hide?.();

  const handleNextStep = () => {
    hideOverlay();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (currentStep < planData.total_steps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        onComplete();
      }
    }, 7000);
  };

  useEffect(() => {
    showOverlayForStep();
    return () => hideOverlay();
  }, [currentStep]);

  const isLastStep = currentStep === planData.total_steps - 1;

  // ✅ 전체 계획 보기: 외부 mock 데이터 사용
  if (showFullPlan) {
    return (
      <FullPlanPanel
        planData={mockPlanDataNormal}
        onBack={() => setShowFullPlan(false)}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid #fff",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#fff", fontSize: 16, marginTop: 20 }}>로딩 중...</p>
        </div>
      )}

      {/* ✅ 상단 버튼 (전체 계획 + 완료만 표시) */}
      <section
        className="card"
        style={{
          padding: "12px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <button style={buttonStyles.plan} onClick={() => setShowFullPlan(true)}>
          <ClipboardList size={14} /> 전체 계획
        </button>

        <button style={buttonStyles.complete} onClick={onComplete}>
          <CheckCircle2 size={14} /> 완료
        </button>
      </section>

      {/* 목표 */}
      <section
        className="card"
        style={{ padding: 16, display: "flex", alignItems: "center", gap: 10 }}
      >
        <Target size={18} style={{ color: "#6d28d9" }} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>목표: {planData.goal}</span>
      </section>

      {/* 현재 단계 */}
      <section className="card" style={{ padding: 20 }}>
        <h3 style={guideHeaderStyle}>
          <BookOpen size={16} /> 가이드
        </h3>
        <p style={{ ...guideBodyStyle, whiteSpace: "pre-line", lineHeight: 1.8 }}>
          {currentStepData.guide}
        </p>
      </section>

      <button
        style={buttonStyles.next}
        onClick={isLastStep ? onComplete : handleNextStep}
        disabled={isLoading}
      >
        {"다음으로"}
      </button>
    </div>
  );
}

// --- 버튼 스타일 ---
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
  plan: {
    ...baseButtonStyle,
    width: "50%",
    backgroundColor: "#eff6ff",
    borderColor: "#dbeafe",
    color: "#2563eb",
  },
  complete: {
    ...baseButtonStyle,
    width: "50%",
    backgroundColor: "#f0fdf4",
    borderColor: "#dcfce7",
    color: "#16a34a",
  },
  next: {
    ...baseButtonStyle,
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderColor: "#1d4ed8",
    fontSize: "14px",
    width: "100%",
    justifyContent: "center",
    padding: "12px 0",
  },
};

const guideHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "600",
  fontSize: "15px",
  color: "#111827",
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
