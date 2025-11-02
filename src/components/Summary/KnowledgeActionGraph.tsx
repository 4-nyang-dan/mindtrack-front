import React from "react";

const exampleGraph = {
  root: "정부 24에서 주민등록등본 발급하기",
  methods: [
    {
      method: "정부24 민원 서비스 메뉴에서 '주민등록등본' 검색 후 발급",
      percentage: 55,
    },
    {
      method: "정부24 메인화면에서 '주민등록등본' 바로가기 이용",
      percentage: 25,
    },
    {
      method: "모바일 정부24 앱을 통해 비회원 인증 후 발급",
      percentage: 15,
    },
    {
      method: "공동인증서 로그인 후, 'MyGov > 나의 민원' 경로로 접근",
      percentage: 5,
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
        fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
        padding: "24px 12px",
        gap: "28px",
      }}
    >
      {/* 중앙 타이틀 */}
      <div
        style={{
          backgroundColor: "white",
          color: "white",
          padding: "14px 30px",
          borderRadius: "10px",
          fontWeight: 7500,
          fontSize: "15px",
          
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ color: "black" }}>
          {exampleGraph.root}
        </div>
        
      </div>

      {/* 설명 */}
      <p
        style={{
          color: "#334155",
          fontSize: "15px",
          textAlign: "center",
          marginTop: "-8px",
          marginBottom: "-4px",
        }}
      >
        👉 다른 사용자는 이렇게 해결했어요
      </p>

      {/* 방법별 비율 박스 */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {exampleGraph.methods.map((item, idx) => (
          <div key={idx}>
            {/* 방법 설명 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "#1e3a8a",
                  fontSize: "15px",
                }}
              >
                {item.method}
              </span>
              <span
                style={{
                  fontWeight: 500,
                  color: "#475569",
                  fontSize: "14px",
                }}
              >
                {item.percentage}%
              </span>
            </div>

            {/* 비율 막대 그래프 */}
            <div
              style={{
                backgroundColor: "#e0f2fe",
                borderRadius: "6px",
                height: "14px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  backgroundColor: "#3b82f6",
                  width: `${item.percentage}%`,
                  height: "100%",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
