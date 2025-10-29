// components/ModeSelection.tsx
import React from "react";
import Topbar from "../../layout/Topbar";
import './ModeSelection.css'; // 스타일시트 추가

interface ModeSelectionProps {
  onModeSelect: (mode: "vulnerable" | "regular") => void;
  onLogout: () => void;  // 로그아웃 처리 함수 받기
  user: { id: string };  // 사용자 정보 받기
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect, onLogout, user }) => {
  return (
    <div className="mode-selection">
      {/* 헤더에 로그아웃 버튼 */}
      <Topbar onLogout={onLogout} />

      <div className="mode-card">
        <div className="header">
          <h2 className="mode-selection-title">반갑습니다, {user.id}님!</h2>
        </div>

        {/* 인사 메시지 개선 */}
        <p className="greeting">사용할 모드를 선택해주세요</p>

        {/* 모드 설명 추가 */}
        <p className="mode-selection-description">
          두 가지 모드가 제공됩니다. <br/>아래 버튼을 눌러 원하는 모드를 선택해 주세요.<br />
          <br />
          - <strong>취약계층 모드</strong>: 접근성이 중요하고 특별한 지원이 필요한 사용자에게 맞춰진 모드<br />
          - <strong>일반 사용자 모드</strong>: 일반적인 기능을 제공하는 기본 모드
        </p>

        <div className="mode-selection-buttons">
          <button className="mode-button vulnerable" onClick={() => onModeSelect("vulnerable")}>
            <img src="/images/vulnerable-icon.png" alt="취약계층 모드 아이콘" className="mode-icon" />
            취약계층 모드
          </button>
          <button className="mode-button regular" onClick={() => onModeSelect("regular")}>
            <img src="/images/regular-icon.png" alt="일반 사용자 모드 아이콘" className="mode-icon" />
            일반 사용자 모드
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
