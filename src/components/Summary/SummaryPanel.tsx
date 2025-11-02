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
            <span>연관 지식 그래프</span>
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
              전체 작업 로그와 수행 내역이 시간 순서대로 표시됩니다.
              {"\n"}(예: 09:31 로그인 완료, 09:34 문서 작성 시작, 09:41 저장)
            </div>
          </div>
        )}
      </section>
    </>
  );
}
