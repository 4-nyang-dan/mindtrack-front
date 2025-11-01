// 모달 관련 UI + 스타일 + 확인/취소 핸들러

import React from "react";

interface MainModalProps {
  isOpen: boolean;
  content: string;
  onConfirm: () => void;
  onClose: () => void;
}

const MainModal: React.FC<MainModalProps> = ({
  isOpen,
  content,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  // --- 스타일 정의 (기존 그대로 이동) ---
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    padding: "24px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    backgroundColor: "white",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

  const modalButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const modalButtonStyleYes: React.CSSProperties = {
    ...modalButtonStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  const modalButtonStyleNo: React.CSSProperties = {
    ...modalButtonStyle,
    backgroundColor: "#f0f0f0",
    color: "#555",
    border: "1px solid #ccc",
  };
  // ---------------------------------------

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} className="card">
        <h3
          style={{
            marginTop: 0,
            marginBottom: "24px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              color: "#007bff",
              fontWeight: "bold",
              wordBreak: "break-all",
            }}
          >
            "{content}"
          </span>
          <br />
          (을)를 목표로 설정 하시겠습니까?
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            gap: "16px",
          }}
        >
          <button onClick={onConfirm} style={modalButtonStyleYes}>
            Yes
          </button>
          <button onClick={onClose} style={modalButtonStyleNo}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainModal;
