import React from "react";

interface TaskGroup {
  title: string;
  subtasks: string[];
}

const exampleData: TaskGroup[] = [
  {
    title: "정부24 웹사이트 접속",
    subtasks: [
      "정부24 검색",
      "웹사이트 링크 클릭",
      "주민등록등본 발급 버튼 선택",
    ],
  },
  {
    title: "간편인증 선택하여 로그인",
    subtasks: [
      "간편인증 수단 선택",
      "개인정보 입력",
      "인증 확인",
    ],
  },
  {
    title: "주민등록등본 발급 신청",
    subtasks: [
      "주민등록등본 주소확인",
      "발급 형태 선택",
      "수령 방법 선택",
      "신청하기",
    ],
  },
  {
    title: "주민등록등본 다운로드 및 출력",
    subtasks: ["문서 출력 클릭", "pdf 선택", "인쇄"],
  },
];

export default function FlowTreeExample() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
        position: "relative",
        paddingLeft: "12px",
      }}
    >
      {exampleData.map((group, idx) => (
        <div
          key={idx}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* 수직 라인 */}
          {(
            <div
              style={{
                position: "absolute",
                left: "5px",
                top: "60px",
                width: "2px",
                height: "calc(100% - 50px)",
                backgroundColor: "#c7d2fe",
                zIndex: 0,
              }}
            />
          )}

          {/* 상위 작업 */}
          <div
            style={{
              backgroundColor: "#1e3a8a",
              color: "white",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "15px",
              position: "relative",
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              width: "fit-content",
              marginLeft: "5px",
            }}
          >
            {group.title}
            <div
              style={{
                position: "absolute",
                left: "-18px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#1e3a8a",
              }}
            />
          </div>

          {/* 세부 작업: 그리드 + 화살표 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "14px 25px", // 가로 여백 확보
              marginLeft: "20px",
              padding: "8px 0",
              position: "relative",
            }}
          >
            {group.subtasks.map((task, i) => (
              <React.Fragment key={i}>
                {/* 작업 박스 */}
                <div
                  style={{
                    background:
                      "linear-gradient(90deg, #eef2ff 0%, #e0e7ff 100%)",
                    border: "1px solid #c7d2fe",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "#1e3a8a",
                    fontWeight: 500,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    minHeight: "40px",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 3px 10px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 5px rgba(0,0,0,0.08)";
                  }}
                >
                  {task}
                  {/* 오른쪽 화살표 */}
                  {i < group.subtasks.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        right: "-15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "18px",
                        color: "#6366f1",
                        fontWeight: 700,
                      }}
                    >
                      →
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
