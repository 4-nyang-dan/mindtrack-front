import React from "react";
import { ArrowLeft, ArrowDown, CheckCircle2 } from "lucide-react";

interface StepData {
  step: number;
  action?: string;
  detail?: string;
}

interface FullPlanPanelProps {
  planData: {
    goal: string;
    total_steps: number;
    steps: StepData[];
    required_resources?: string[];
  };
  onBack: () => void;
}

export default function FullPlanPanel({ planData, onBack }: FullPlanPanelProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* 돌아가기 버튼 */}
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: "none",
          color: "#2563eb",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: 14,
          marginBottom: "18px",
          marginTop: "10px",
        }}
      >
        <ArrowLeft size={18} />
        돌아가기
      </button>

      {/* 목표 */}
      <div
        style={{
          background: "linear-gradient(90deg, #eef2ff 0%, #e0e7ff 100%)",
          border: "1px solid #c7d2fe",
          color: "#1e3a8a",
          padding: "16px 24px",
          borderRadius: "12px",
          fontWeight: 700,
          fontSize: "17px",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          marginBottom: "36px",
          width: "95%",
        }}
      >
        {planData.goal}
      </div>

      {/* 단계별 카드 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "36px",
          width: "95%",
        }}
      >
        {planData.steps.map((s, idx) => (
          <React.Fragment key={s.step}>
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
                padding: "22px 26px",
                width: "100%",
                maxWidth: 680,
                transition: "transform 0.2s ease",
              }}
            >
              {/* 단계 헤더 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    borderRadius: "50%",
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: 700,
                    fontSize: "15px",
                    boxShadow: "0 2px 6px rgba(59,130,246,0.3)",
                  }}
                >
                  {s.step}
                </div>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#1e3a8a",
                    lineHeight: 1.4,
                  }}
                >
                  {s.action || `단계 ${s.step}`}
                </span>
              </div>

              {/* 세부 단계 리스트 */}
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {(s.detail?.split("\n") || ["세부 설명이 없습니다."]).map((line, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      color: "#334155",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    <CheckCircle2
                      size={14}
                      color="#3b82f6"
                      style={{ marginTop: "2px", flexShrink: 0 }}
                    />
                    <span>{line.replace(/^\d+\.\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>

            {idx < planData.steps.length - 1 && (
              <ArrowDown color="#60a5fa" size={28} strokeWidth={2} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 필요한 자원 */}
      {planData.required_resources && (
        <div
          style={{
            marginTop: "48px",
            backgroundColor: "#eff6ff",
            borderRadius: "10px",
            padding: "18px 20px",
            width: "100%",
            maxWidth: 640,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: "15px",
              color: "#1e3a8a",
              marginBottom: "8px",
            }}
          >
            필요한 준비물 🧾
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: "18px",
              color: "#334155",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {planData.required_resources.map((res, i) => (
              <li key={i}>{res}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
