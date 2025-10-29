import React from "react";

interface TopbarProps {
  onLogout: () => void;
  showBackButton?: boolean; // ✅ 이전 버튼 표시 여부
  onBack?: () => void;      // ✅ 이전 버튼 클릭 시 동작
}

const Topbar: React.FC<TopbarProps> = ({ onLogout, showBackButton, onBack }) => {
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
        padding: "10px 16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        zIndex: 10,
      }}
    >
      {/* 왼쪽: 로고 + MindTrack + 이전 버튼 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* ✅ 기존 CSS 로고 적용 */}
        <div className="logo" />

        {/* MindTrack 텍스트 */}
        <div
          style={{
            fontWeight: 800,
            fontSize: 16,
            color: "var(--text-strong, #222)",
          }}
        >
          MindTrack
        </div>

        {/* ✅ 이전 버튼 (선택적으로 표시) */}
        {showBackButton && (
          <button
            onClick={onBack}
            style={{
              background: "#eef3ff",
              border: "1px solid #d0d8ff",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#334",
              marginLeft: 8,
              fontSize: 14.5,
            }}
          >
            ← 이전
          </button>
        )}
      </div>

      {/* 오른쪽: 설정 / 로그아웃 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          style={{
            border: "none",
            background: "#f3f3f3",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          ⚙️ 설정
        </button>
        <button
          style={{
            border: "none",
            background: "#ffe5e5",
            color: "#e00",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
          onClick={onLogout}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Topbar;
