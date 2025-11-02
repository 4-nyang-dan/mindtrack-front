import React from "react";

const exampleGraph = {
  root: "주민등록등본 발급",
  actions: [
    {
      name: "인감증명서 발급",
      related: ["본인인증", "무인발급기 이용 방법"],
    },
    {
      name: "전입신고",
      related: ["정부24 로그인", "주소 변경 서류 안내"],
    },
    {
      name: "가족관계증명서 발급",
      related: ["정부24 공동인증서", "법원 가족관계등록 시스템"],
    },
  ],
};

export default function KnowledgeActionGraph() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
        fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
        padding: "16px 8px",
      }}
    >
      {/* 중앙 루트 노드 */}
      <div
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "16px",
          textAlign: "center",
          boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        {exampleGraph.root}
      </div>

      {/* 연결선 */}
      <div
        style={{
          marginTop: "-30px",
          marginBottom: "-30px",
          width: "2px",
          height: "30px",
          backgroundColor: "#2563eb",
        }}
      />

      {/* 1차 행동 노드 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "36px",
          width: "100%",
        }}
      >
        {exampleGraph.actions.map((action, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* 행동 박스 */}
            <div
              style={{
                backgroundColor: "#f0f9ff",
                color: "#1e3a8a",
                padding: "10px 20px",
                border: "1px solid #93c5fd",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "15px",
                textAlign: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                whiteSpace: "nowrap",
              }}
            >
              {action.name}
            </div>

            {/* 세부 연결선 */}
            <div
              style={{
                width: "2px",
                height: "14px",
                backgroundColor: "#60a5fa",
              }}
            />

            {/* 관련 정보 노드 */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {action.related.map((info, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#e0f2fe",
                    color: "#0c4a6e",
                    border: "1px solid #93c5fd",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {info}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
