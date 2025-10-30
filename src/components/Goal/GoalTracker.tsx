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
} from "lucide-react";

// --- (추가) 타입 정의 ---
interface PlanStep {
  step: number;
  action: string;
  guide: string;
  detail: string;
}

export interface PlanData { // (수정) Main.tsx에서 import 할 수 있도록 export
  goal: string;
  total_steps: number;
  steps: PlanStep[];
}

// --- (제거) Mock 데이터 제거 ---
// const mockPlanData: PlanData = { ... };
// ------------------------------

// 공통 버튼 스타일
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

// --- (수정) 버튼 스타일 (색상 추가) ---
const buttonStyles: { [key: string]: React.CSSProperties } = {
  help: {
    ...baseButtonStyle,
    backgroundColor: "#fff1f2", // Light Red
    borderColor: "#ffdde0",
    color: "#be123c", // Dark Red
  },
  plan: {
    ...baseButtonStyle,
    backgroundColor: "#eff6ff", // Light Blue
    borderColor: "#dbeafe",
    color: "#2563eb", // Dark Blue
  },
  summary: {
    ...baseButtonStyle,
    backgroundColor: "#f5f3ff", // Light Purple
    borderColor: "#e0e7ff",
    color: "#6d28d9", // Dark Purple
  },
  complete: {
    ...baseButtonStyle,
    backgroundColor: "#f0fdf4", // Light Green
    borderColor: "#dcfce7",
    color: "#16a34a", // Dark Green
  },
};
// ---------------------------------

// --- (수정) Props 인터페이스 ---
interface GoalTrackerProps {
  planData: PlanData; // (수정) JSON 데이터를 prop으로 받음
  onComplete: () => void;
}
// -----------------------------

export default function GoalTracker({ planData, onComplete }: GoalTrackerProps) {
  // --- (수정) 상태 관리 ---
  // const [planData] = useState<PlanData>(mockPlanData); // (제거)
  const [currentStep, setCurrentStep] = useState(0); // 현재 단계 (0-indexed)
  // -------------------------

  // --- (추가) 현재 단계에 맞는 데이터 추출 ---
  const currentStepData = useMemo(() => {
    // (수정) prop으로 받은 planData 사용
    return planData.steps[currentStep];
  }, [currentStep, planData]);
  // ------------------------------------

  // --- (추가) 네비게이션 핸들러 ---
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, planData.total_steps - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === planData.total_steps - 1;
  // ----------------------------------

  // --- (추가) 페이지네이션 점들 ---
  const renderDots = () => {
    return Array.from({ length: planData.total_steps }, (_, index) => (
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
  };
  // ------------------------------

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
      }}
    >
      {/* --- (수정) 1. 상단 버튼 (이름 변경, 색상/아이콘 적용) --- */}
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

      {/* --- (수정) 2. 목표 표시 (JSON 데이터 사용) --- */}
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
        <span style={{ fontWeight: "600", fontSize: "15px" }}>
          목표: {planData.goal}
        </span>
      </section>

      {/* --- (수정) 3. 현재 단계 (동적 텍스트, 네비게이션) --- */}
      <section className="card" style={{ padding: "20px" }}>
        <h3
          style={{
            textAlign: "center",
            fontWeight: "600",
            fontSize: "14px",
            color: "#4b5563",
            margin: 0,
            marginBottom: "12px",
          }}
        >
          현재 단계
        </h3>

        {/* (추가) 단계 텍스트 (action) */}
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
            color: "#111827",
            margin: 0,
            marginBottom: "20px",
            minHeight: "2.5em", // 텍스트 길이에 따른 높이 변화 방지
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
          {/* 왼쪽 화살표 */}
          <button
            onClick={handlePrevStep}
            disabled={isFirstStep}
            style={{ ...navButtonStyle, opacity: isFirstStep ? 0.4 : 1 }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* 페이지 표시 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1f2937",
              }}
            >
              {currentStep + 1} / {planData.total_steps}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>{renderDots()}</div>
          </div>

          {/* 오른쪽 화살표 */}
          <button
            onClick={handleNextStep}
            disabled={isLastStep}
            style={{ ...navButtonStyle, opacity: isLastStep ? 0.4 : 1 }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* --- (수정) 4. 가이드 (동적 텍스트) --- */}
      <section className="card" style={{ padding: "20px" }}>
        <h3 style={guideHeaderStyle}>
          <BookOpen size={16} />
          가이드
        </h3>
        <p style={guideBodyStyle}>{currentStepData.guide}</p>
      </section>

      {/* --- (수정) 5. 상세 가이드 (동적 텍스트) --- */}
      <section className="card" style={{ padding: "20px" }}>
        <h3 style={guideHeaderStyle}>
          <ZoomIn size={16} />
          상세 가이드
        </h3>
        <p
          style={{
            ...guideBodyStyle,
            whiteSpace: "pre-line", // (추가) \n을 줄바꿈으로 표시
            lineHeight: 1.8,
          }}
        >
          {currentStepData.detail}
        </p>
      </section>
    </div>
  );
}

// --- (추가) 네비게이션 버튼 스타일 ---
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

// --- (추가) 가이드 섹션 스타일 ---
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

