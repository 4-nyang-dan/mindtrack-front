// components/Topbar.tsx
import React from "react";

interface TopbarProps {
  onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onLogout }) => {
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="logo" />
        <div style={{ fontWeight: 800 }}>MindTrack</div>
      </div>
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
