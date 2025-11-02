import React, { useState } from "react";
import FlowTreeExample from "./FlowTree";
import KnowledgeActionGraph from "./KnowledgeActionGraph";

interface Props {
  // 나중에 데이터 연결 시 props로 전달 가능
}

export default function SummaryPanel({}: Props) {
  // 각 섹션의 접힘/펼침 상태
  const [sectionsVisible, setSectionsVisible] = useState({
    tree: true,
    knowledge: true,
    details: true,
  });

  const toggleSection = (section: "tree" | "knowledge" | "details") => {
    setSectionsVisible((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const headerBase: React.CSSProperties = {
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
    fontSize: 16,
    fontWeight: 700,
  };

  const headerButton: React.CSSProperties = {
    ...headerBase,
    background: "none",
    border: "none",
    color: "inherit",
    padding: 0,
    cursor: "pointer",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
  };

  const toggleIcon: React.CSSProperties = {
    fontSize: "14px",
    opacity: 0.8,
    width: "20px",
    textAlign: "center",
  };

  const cardBoxStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #f9fbff 0%, #f2f6ff 100%)",
    border: "1px solid rgba(190,200,230,0.4)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    lineHeight: 1.8,
    color: "#222",
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
    whiteSpace: "pre-line",
    transition: "all 0.3s ease",
  };

  const getCardStyle = (isVisible: boolean): React.CSSProperties => ({
    padding: isVisible ? "16px" : "12px 16px",
    transition: "padding 0.2s ease-out",
  });

  return (
    <>
      {/* 1️⃣ 작업 흐름 트리 */}
      <section className="card" style={getCardStyle(sectionsVisible.tree)}>
      <button
          style={{
          ...headerButton,
          marginBottom: sectionsVisible.tree ? 10 : 0,
          }}
          onClick={() => toggleSection("tree")}
      >
          <span>작업 흐름 트리</span>
          <span style={toggleIcon}>
          {sectionsVisible.tree ? "▼" : "►"}
          </span>
      </button>
      {sectionsVisible.tree && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "20px", marginBottom: "20px" }}>
          <FlowTreeExample />
          </div>
      )}
      </section>

        {/* 2️⃣ 연관 지식 그래프 */}
        <section className="card" style={getCardStyle(sectionsVisible.knowledge)}>
        <button
            style={{
            ...headerButton,
            marginBottom: sectionsVisible.knowledge ? 10 : 0,
            }}
            onClick={() => toggleSection("knowledge")}
        >
            <span>행동 비율 그래프</span>
            <span style={toggleIcon}>
            {sectionsVisible.knowledge ? "▼" : "►"}
            </span>
        </button>
        {sectionsVisible.knowledge && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <KnowledgeActionGraph />
            </div>
        )}
        </section>

      {/* 3️⃣ 작업 전체 상세보기 */}
      <section className="card" style={getCardStyle(sectionsVisible.details)}>
        <button
          style={{
            ...headerButton,
            marginBottom: sectionsVisible.details ? 10 : 0,
          }}
          onClick={() => toggleSection("details")}
        >
          <span>작업 전체 상세보기</span>
          <span style={toggleIcon}>
            {sectionsVisible.details ? "▼" : "►"}
          </span>
        </button>
        {sectionsVisible.details && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={cardBoxStyle}>
              2025-10-22T10:31:00 | step=1 | medium=구글 | action=검색창에 검색어 입력 | subject="정부24"
              {"\n"}2025-10-22T10:31:00 | step=1 | medium=구글 | action=검색 실행 | subject="정부24"
              {"\n"}2025-10-22T10:31:15 | step=1 | medium=정부24 | action=검색 결과 링크 클릭 | subject="정부24 홈페이지"
              {"\n"}2025-10-22T10:31:15 | step=1 | medium=정부24 | action=페이지 탐색 | subject="정부24 메인 화면"
              {"\n"}2025-10-22T10:31:30 | step=1 | medium=정부24 | action=메뉴 이동 | subject="민원서비스 - 주민등록"
              {"\n"}2025-10-22T10:31:30 | step=1 | medium=정부24 | action=메뉴 선택 | subject="주민등록등본 발급"

              {"\n"}2025-10-22T10:31:45 | step=2 | medium=정부24 | action=로그인 과정 진입 | subject="간편인증 로그인"
              {"\n"}2025-10-22T10:31:45 | step=2 | medium=정부24 | action=인증 수단 선택 | subject="간편 인증"
              {"\n"}2025-10-22T10:32:00 | step=2 | medium=정부24 | action=인증 정보 기입 | subject="간편인증"
              {"\n"}2025-10-22T10:32:15 | step=2 | medium=정부24 | action=본인 인증 요청 확인 | subject="카카오 인증 요청"
              {"\n"}2025-10-22T10:32:15 | step=2 | medium=정부24 | action=본인 인증 수행 | subject="생체 / 비밀번호 인증"
              {"\n"}2025-10-22T10:32:30 | step=2 | medium=정부24 | action=본인 인증 수행 | subject="생체 / 비밀번호 인증"
              {"\n"}2025-10-22T10:32:45 | step=2 | medium=정부24 | action=로그인 완료 | subject="정부24 사용자 세션 활성화"

              {"\n"}2025-10-22T10:32:45 | step=3 | medium=정부24 | action=주소 확인 | subject="주소 및 세대 구성 정보"
              {"\n"}2025-10-22T10:33:00 | step=3 | medium=정부24 | action=발급 형태 선택 | subject="민원 제출용 / 열람용"
              {"\n"}2025-10-22T10:33:00 | step=3 | medium=정부24 | action=수령 방법 선택 | subject="온라인 발급"
              {"\n"}2025-10-22T10:33:15 | step=3 | medium=정부24 | action=발급 신청 제출 | subject="주민등록등본 발급 요청"

              {"\n"}2025-10-22T10:33:15 | step=4 | medium=문서 뷰어 | action=문서 열기 | subject="주민등록등본 PDF"
              {"\n"}2025-10-22T10:33:30 | step=4 | medium=문서 뷰어 | action=파일 저장 | subject="주민등록등본.pdf"
              {"\n"}2025-10-22T10:33:30 | step=4 | medium=프린터 | action=문서 출력 | subject="주민등록등본"
            </div>
          </div>
        )}
      </section>
    </>
  );
}
