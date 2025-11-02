import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  ClipboardList,
  Target,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

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

const buttonStyles: { [key: string]: React.CSSProperties } = {
  help: {
    ...baseButtonStyle,
    backgroundColor: "#fff1f2",
    borderColor: "#ffdde0",
    color: "#be123c",
  },
  plan: {
    ...baseButtonStyle,
    backgroundColor: "#eff6ff",
    borderColor: "#dbeafe",
    color: "#2563eb",
  },
  summary: {
    ...baseButtonStyle,
    backgroundColor: "#f5f3ff",
    borderColor: "#e0e7ff",
    color: "#6d28d9",
  },
  complete: {
    ...baseButtonStyle,
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

interface GoalTrackerProps {
  planData: PlanData;
  onComplete: () => void;
}

export default function GoalTracker({ planData, onComplete }: GoalTrackerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const currentStepData = useMemo(() => {
    return planData.steps[currentStep];
  }, [currentStep, planData]);

  const showOverlayForStep = () => {
    const highlight = currentStepData.highlight;
    if (!highlight) return;

    (window as any).overlay.show({
      boxes: [highlight],
      screenshotPath: "",
    });
  };

  const hideOverlay = () => {
    (window as any).overlay.hide();
  };

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
    }, 5000);
  };

  React.useEffect(() => {
    showOverlayForStep();
    return () => hideOverlay();
  }, [currentStep]);

  const isLastStep = currentStep === planData.total_steps - 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        position: "relative",
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "fixed", // 전체 프로그램 화면 덮기
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
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
          <p
            style={{
              color: "#fff",
              fontSize: "16px",
              marginTop: "20px",
            }}
          >
            로딩 중...
          </p>
        </div>
      )}

      <section
        className="card"
        style={{
          padding: "12px",
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <button style={buttonStyles.help}>
          <HelpCircle size={14} />
          HELP
        </button>
        <button style={buttonStyles.plan}>
          <ClipboardList size={14} />
          전체 계획
        </button>
        <button style={buttonStyles.summary}>
          <Target size={14} />
          작업 요약
        </button>
        <button style={buttonStyles.complete} onClick={onComplete}>
          <CheckCircle2 size={14} />
          완료
        </button>
      </section>

      {/* 목표 표시 */}
      <section className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Target size={18} style={{ color: "#6d28d9" }} />
        <span style={{ fontWeight: "600", fontSize: "15px" }}>목표: {planData.goal}</span>
      </section>

      {/* 현재 단계 가이드 표시 */}
      <section className="card" style={{ padding: "20px" }}>
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
        {isLastStep ? "완료하기" : "다음으로"}
      </button>
    </div>
  );
}

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
