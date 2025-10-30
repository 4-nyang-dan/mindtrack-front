import React, { useState } from "react";

// 컴포넌트 Props 정의
interface Props {
  purpose: string; // 설정된 목표 텍스트
  onComplete: () => void; // "완료" 버튼 클릭 시 호출될 함수 (purpose를 초기화)
}

// 공통 버튼 스타일 (상단 4개 버튼)
const goalButtonStyle: React.CSSProperties = {
  flex: 1, // 4개 버튼이 공간을 균등하게 차지
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  background: "#ffffff",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textAlign: "center",
  whiteSpace: "nowrap", // 줄바꿈 방지
};

// '완료' 버튼을 위한 별도 스타일
const completeButtonStyle: React.CSSProperties = {
  ...goalButtonStyle,
  background: "#ffefef", // 붉은 계열 배경
  color: "#d90429", // 붉은 계열 텍스트
  border: "1px solid #ffb3b3",
};

// '가이드' 카드 스타일
const guideCardStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  minHeight: "100px", // 스케치(image_9fff3a.png) 참고
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  background: "#ffffff",
  boxSizing: "border-box", // 패딩 포함 크기 계산
  fontSize: "15px",
  lineHeight: 1.6,
};

// 메인 컴포넌트
export default function GoalTracker({ purpose, onComplete }: Props) {
  // 현재 단계 상태 관리 (스케치: image_9fff1a.png)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // 스케치 예시(1/6) 기준

  // 단계 이동 핸들러
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1)); // 1단계 밑으로 못 내려가게
  };
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps)); // totalSteps 위로 못 올라가게
  };

  return (
    // 전체 UI를 감싸는 div (Main.tsx의 gap: 16px와 일관되게)
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "16px",
      }}
    >
      {/* 1. 상단 버튼 4개 (스케치: image_9ffebd.png) */}
      <section className="card" style={{ padding: "12px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button style={goalButtonStyle}>🆘 HELP</button>
          <button style={goalButtonStyle}>🗺️ 전체 계획</button>
          <button style={goalButtonStyle}>📑 세부계획</button>
          <button
            style={completeButtonStyle} // '완료' 버튼
            onClick={onComplete} // 클릭 시 Main.tsx의 handleReset 호출
          >
            ✅ 완료
          </button>
        </div>
      </section>

      {/* 2. 목표 표시 (스케치: image_9ffef8.png) */}
      <section className="card" style={{ padding: "16px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            color: "#333",
          }}
        >
          🎯 목표:{" "}
          <span style={{ color: "#007bff", fontWeight: "bold" }}>
            {purpose}
          </span>
        </h3>
      </section>

      {/* 3. 단계 네비게이터 (스케치: image_9fff1a.png) */}
      <section className="card" style={{ padding: "16px" }}>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            fontSize: "16px",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          현재 단계
        </h3>
        {/* 네비게이터 UI */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {/* 왼쪽 화살표 */}
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            style={{ ...goalButtonStyle, flex: 0, padding: "12px", background: currentStep === 1 ? "#f0f0f0" : "white" }}
          >
            ⬅️
          </button>
          {/* 단계 표시 (1 / 6) */}
          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
            {currentStep} / {totalSteps}
          </span>
          {/* 오른쪽 화살표 */}
          <button
            onClick={handleNextStep}
            disabled={currentStep === totalSteps}
            style={{ ...goalButtonStyle, flex: 0, padding: "12px", background: currentStep === totalSteps ? "#f0f0f0" : "white" }}
          >
            ➡️
          </button>
        </div>
        {/* 단계 표시 점 (Dots) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background:
                  index + 1 === currentStep ? "#007bff" : "#e0e0e0",
                transition: "background 0.3s",
              }}
            ></div>
          ))}
        </div>
      </section>

      {/* 4. 가이드 (스케치: image_9fff3a.png) */}
      <section style={guideCardStyle}>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "10px",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          📘 가이드
        </h3>
        {/* TODO: 가이드 내용 */}
        <p style={{ margin: 0 }}>
          {/* 단계별 가이드 (임시) */}
          현재 {currentStep}단계에 대한 가이드 내용이 여기에 표시됩니다.
        </p>
      </section>

      {/* 5. 상세 가이드 (스케치: image_9fff58.png) */}
      <section style={guideCardStyle}>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "10px",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          🔍 상세 가이드
        </h3>
        {/* TODO: 상세 가이드 내용 */}
        <p style={{ margin: 0 }}>
          {/* 단계별 상세 가이드 (임시) */}
          {currentStep}단계의 상세 가이드입니다. 더 자세한 정보가 필요한 경우
          이곳을 참고하세요.
        </p>
      </section>
    </div>
  );
}
