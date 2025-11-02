import React, { useEffect } from "react";

const SelectBoxButton: React.FC = () => {
  useEffect(() => {
    const removeListener = window.overlaySelect.onBoxSelected((box) => {
      console.log("📐 선택된 비율 좌표:", box);
      alert(
        `x:${(box.xRatio * 100).toFixed(2)}%, y:${(box.yRatio * 100).toFixed(
          2
        )}%, w:${(box.widthRatio * 100).toFixed(2)}%, h:${(
          box.heightRatio * 100
        ).toFixed(2)}%`
      );
    });
    return removeListener;
  }, []);

  const handleSelectArea = () => {
    console.log("🖱️ 화면 영역 선택 시작");
    window.overlaySelect.show(); // ✅ 새 overlay2.html 사용
  };

  return (
    <button
      style={{
        padding: "10px 20px",
        borderRadius: 8,
        background: "#0078ff",
        color: "white",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
      }}
      onClick={handleSelectArea}
    >
      화면 영역 선택
    </button>
  );
};

export default SelectBoxButton;
