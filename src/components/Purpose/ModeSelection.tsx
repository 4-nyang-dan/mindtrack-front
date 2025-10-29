import React from "react";
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
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
