import React, { useEffect } from "react";
import Topbar from "../../layout/Topbar";
import styles from "./ModeSelection.module.css";

interface ModeSelectionProps {
  onModeSelect: (mode: "vulnerable" | "regular") => void;
  onLogout: () => void;
  user: { id: string };
}

const ModeSelection: React.FC<ModeSelectionProps> = ({
  onModeSelect,
  onLogout,
  user,
}) => {
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

  // ✅ 버튼 클릭 → Overlay 표시
  const handleSelectArea = () => {
    console.log("🖱️ 드래그 모드 시작");
    window.overlaySelect.show();
  };

  return (
    <div className={styles.modeSelectionWrapper}>
      <Topbar onLogout={onLogout} />

      <div className={styles.centerWrapper}>
        <div className={styles.modeCard}>
          <h2 className={styles.modeSelectionTitle}>
            반갑습니다, {user.id}님 👋
          </h2>

          <p className={styles.modeGreeting}>사용할 모드를 선택해주세요</p>

          <div className={styles.modeSelectionDescription}>
            <p>
              두 가지 모드가 제공됩니다.
              <br />
              아래에서 원하는 환경을 선택해 주세요.
            </p>
          </div>

          {/* 카드형 리스트 구조 */}
          <div className={styles.modeList}>
            <div className={styles.modeInfoBox}>
              <strong>취약계층 모드</strong>
              <p>접근성 향상과 추가 안내를 제공합니다.</p>
            </div>
            <div className={styles.modeInfoBox}>
              <strong>일반 사용자 모드</strong>
              <p>기본 기능 중심의 깔끔한 인터페이스입니다.</p>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className={styles.modeSelectionButtons}>
            <button
              className={`${styles.modeButton} ${styles.vulnerable}`}
              onClick={() => onModeSelect("vulnerable")}
            >
              <img
                src="/images/vulnerable-icon.png"
                alt="취약계층 모드 아이콘"
                className={styles.modeIcon}
              />
              취약계층 모드로 시작하기
            </button>

            <button
              className={`${styles.modeButton} ${styles.regular}`}
              onClick={() => onModeSelect("regular")}
            >
              <img
                src="/images/regular-icon.png"
                alt="일반 사용자 모드 아이콘"
                className={styles.modeIcon}
              />
              일반 사용자 모드로 시작하기
            </button>
          </div>

          {/* ✅ 새로 추가된: 화면 영역 선택 버튼 */}
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <button
              onClick={handleSelectArea}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#0078ff",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              🖱️ 화면 영역 선택
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
