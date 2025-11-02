import React from "react";

interface TopbarProps {
  onLogout: () => void;
  onHome?: () => void;  // 🏠 처음으로
  onBack?: () => void;  // ← 이전으로
}

const Topbar: React.FC<TopbarProps> = ({ onLogout, onHome, onBack }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 520,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255,255,255,0.9)",
        borderRadius: 12,
        padding: "8px 14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        zIndex: 10,
        boxSizing: "border-box",
      }}
    >
      {/* --- 왼쪽: 로고 + MindTrack + 버튼 영역 --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minWidth: 0, // 긴 텍스트 방지
        }}
      >
        {/* 로고 */}
        <div className="logo" />

        {/* MindTrack 텍스트 */}
        <div
          style={{
            fontWeight: 800,
            fontSize: 15,
            color: "var(--text-strong, #222)",
            whiteSpace: "nowrap",
          }}
        >
          MindTrack
        </div>

        {/* --- 버튼 영역 (줄바꿈 방지 + 간격 줄임) --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: 6,
            flexWrap: "nowrap",
          }}
        >
          {onHome && (
            <button
              onClick={onHome}
              style={buttonStyle("#eef3ff", "#334")}
            >
              🏠처음으로
            </button>
          )}
        </div>
      </div>

      {/* --- 오른쪽: 설정 / 로그아웃 --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <button style={rightButtonStyle("#f3f3f3", "#222")}>⚙️ 설정</button>
        <button
          style={rightButtonStyle("#ffe5e5", "#e00")}
          onClick={onLogout}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

// 🔸 공통 스타일 함수
const buttonStyle = (bg: string, color: string): React.CSSProperties => ({
  background: bg,
  width: "120%",
  border: "1px solid #d0d8ff",
  borderRadius: 6,
  padding: "4px 8px",
  fontSize: 14,
  fontWeight: 600,
  color: color,
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
  lineHeight: 1.2,
});

// 🔸 오른쪽 버튼 스타일
const rightButtonStyle = (bg: string, color: string): React.CSSProperties => ({
  background: bg,
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 13,
  fontWeight: 500,
  color: color,
  cursor: "pointer",
  whiteSpace: "nowrap",
});

export default Topbar;
