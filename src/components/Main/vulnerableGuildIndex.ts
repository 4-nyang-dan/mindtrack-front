import { PlanData } from "../Goal/VulnerableGoalTracker";

export const mockPlanData: PlanData = {
  goal: "주민등록등본을 인터넷을 통해 발급받기.",
  total_steps: 11,
  steps: [
    {
      step: 1,
      guide: "화면 가운데에 있는 검색창에 '정부24'라고 입력하고 엔터를 눌러주세요.",
      highlight: { x: 100, y: 200, width: 280, height: 120 },
    },
    {
      step: 2,
      guide: "검색 결과에서 '정부24'라고 적힌 공식 홈페이지 링크를 눌러주세요.",
      highlight: { x: 320, y: 140, width: 200, height: 90 },
    },
    {
      step: 3,
      guide: "정부24 메인 화면에서 [주민등록등본(초본)] 항목을 찾아 눌러주세요.",
      highlight: { x: 80, y: 360, width: 260, height: 110 },
    },
    {
      step: 4,
      guide: "주민등록표 등본 발급 화면에서 '발급하기' 버튼을 눌러주세요.",
      highlight: { x: 160, y: 250, width: 230, height: 100 },
    },
    {
      step: 5,
      guide: "서비스를 이용하기 위해 로그인 또는 회원가입이 필요합니다. '회원가입' 또는 '로그인' 버튼을 눌러주세요.",
      highlight: { x: 160, y: 250, width: 230, height: 100 },
    },
    {
      step: 6,
      guide: "로그인 화면에서 '간편인증'을 눌러주세요.",
      highlight: { x: 160, y: 250, width: 230, height: 100 },
    },
    {
      step: 7,
      guide: "인증 수단 목록에서 '민간인증서'를 선택해주세요. (예: 카카오, PASS, 네이버 등)",
      highlight: { x: 160, y: 250, width: 230, height: 100 },
    },
    {
      step: 8,
      guide: "이름을 적는 칸에 본인의 이름을 입력해주세요.",
      highlight: { x: 160, y: 250, width: 230, height: 100 },
    },
    {
      step: 9,
      guide: "생년월일 입력 칸에 생년월일 8자리(예: 19920101)를 입력해주세요.",
      highlight: { x: 160, y: 250, width: 230, height: 100 },
    },
    {
      step: 10,
      guide: "휴대폰 번호 입력 칸에 본인의 전화번호를 입력해주세요.",
      highlight: { x: 160, y: 250, width: 230, height: 100 },
    },
    {
      step: 11,
      guide: "입력이 모두 끝나면 '인증 요청' 버튼을 눌러주세요.",
      highlight: { x: 160, y: 250, width: 230, height: 100 },
    },
  ],
};
