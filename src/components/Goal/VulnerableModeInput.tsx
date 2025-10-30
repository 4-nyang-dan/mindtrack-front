import React, { useState } from "react";
import { Mic, Send } from "lucide-react";

// (추가) 음파 애니메이션을 위한 스타일
const waveKeyframes = `
  @keyframes wave {
    0% { transform: scale(0.5); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 0.2; }
    100% { transform: scale(1.8); opacity: 0; }
  }
`;

// --- 취약계층 모드 전용 입력 컴포넌트 ---
interface VulnerableModeInputProps {
  // Main.tsx로 목표 텍스트를 전달하고 GoalTracker로 넘어가게 할 함수
  onSubmitGoal: (goal: string) => void;
}

export default function VulnerableModeInput({ onSubmitGoal }: VulnerableModeInputProps) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);

  // '전송' 버튼 핸들러
  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmitGoal(inputText.trim());
    }
  };

  // '마이크' 버튼 핸들러
  const handleMicClick = () => {
    setIsListening(true);
    
    // --- (시뮬레이션) ---
    // TODO: 여기에 실제 Web Speech API (STT) 시작 로직을 구현
    // 지금은 3초 후에 가짜 텍스트를 입력하고 모달을 닫습니다.
    setTimeout(() => {
      const mockResult = "주민등록등본 발급받고 싶어요";
      setInputText(mockResult);
      setIsListening(false);
    }, 3000);
    // ---------------------
  };

  // '듣는 중...' 모달 스타일
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    color: "white",
  };

  const micIconContainer: React.CSSProperties = {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "150px",
    height: "150px",
  };

  const waveStyle: React.CSSProperties = {
    position: "absolute",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 123, 255, 0.7)",
    animation: "wave 1.5s infinite ease-out",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
        padding: "16px",
        boxSizing: "border-box"
      }}
    >
      {/* 1. 스타일 태그 (애니메이션) */}
      <style>{waveKeyframes}</style>
      
      {/* 2. '듣는 중...' 모달 */}
      {isListening && (
        <div style={modalOverlayStyle} onClick={() => setIsListening(false)}>
          <h2 style={{ fontWeight: 600, marginBottom: "40px" }}>듣고 있습니다...</h2>
          <div style={micIconContainer}>
            {/* 음파 애니메이션 */}
            <div style={waveStyle}></div>
            <div style={{ ...waveStyle, animationDelay: "0.5s" }}></div>
            {/* 마이크 아이콘 */}
            <Mic size={60} style={{ zIndex: 1, color: "white" }} />
          </div>
          <p style={{ marginTop: "40px", opacity: 0.8 }}>화면을 클릭하면 중지됩니다.</p>
        </div>
      )}

      {/* 3. 취약계층 모드 입력 UI */}
      <section className="card" style={{ padding: "24px" }}>
        <h3
          style={{
            textAlign: "center",
            fontWeight: "600",
            fontSize: "18px",
            color: "#111827",
            margin: 0,
            marginBottom: "12px",
          }}
        >
          목표를 설정해주세요
        </h3>
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#4b5563",
            margin: 0,
            marginBottom: "20px",
            lineHeight: 1.6,
          }}
        >
          아래 입력창에 원하시는 목표를 입력하시거나,
          <br />
          마이크 버튼을 눌러 말씀해 주세요.
        </p>

        {/* 텍스트 입력창 */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="예: 주민등록등본 발급받기"
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "15px",
            lineHeight: 1.6,
            resize: "none",
            boxSizing: "border-box", // 패딩 포함 크기 계산
          }}
        />

        {/* 버튼 그룹 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {/* 마이크 버튼 */}
          <button
            onClick={handleMicClick}
            style={{
              flex: 1, // '전송' 버튼과 공간을 나눠 가짐
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
            }}
          >
            <Mic size={18} />
            음성으로 입력
          </button>

          {/* 전송 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: inputText.trim() ? "#007bff" : "#e5e7eb", // 활성/비활성 색
              color: inputText.trim() ? "#ffffff" : "#9ca3af",
              fontWeight: "600",
              cursor: inputText.trim() ? "pointer" : "not-allowed",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
            }}
          >
            <Send size={18} />
            전송
          </button>
        </div>
      </section>
    </div>
  );
}
