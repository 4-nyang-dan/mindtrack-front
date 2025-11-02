import { PlanData } from "../../Goal/VulnerableGoalTracker";

export const mockPlanDataVulnerable: PlanData = {
  goal: "주민등록등본을 인터넷을 통해 발급받기.",
  total_steps: 12,
  steps: [
    {
      step: 1,
      guide: "화면 가운데에 있는 검색창에 '정부24'라고 입력하고 엔터를 눌러주세요.",
      highlight: { x: 0.1035, y: 0.4186, width: 0.4757, height: 0.0642 },
    },
    {
      step: 2,
      guide: "검색 결과에서 '정부24'라고 적힌 공식 홈페이지 링크를 눌러주세요.",
      highlight: { x: 0.0131, y: 0.3101, width: 0.4239, height: 0.1495 },
    },
    {
      step: 3,
      guide: "정부24 메인 화면에서 [주민등록등본(초본)] 항목을 찾아 눌러주세요.",
      highlight: { x: 0.1415, y: 0.4917, width: 0.0929, height: 0.0498 },
    },
    {
      step: 4,
      guide: "주민등록표 등본 발급 화면에서 '발급하기' 버튼을 눌러주세요.",
      highlight: { x: 0.4688, y: 0.7807, width: 0.1584, height: 0.0709 },
    },
    {
      step: 5,
      guide: "",
      highlight: { x: 0.2494, y: 0.5194, width: 0.0898, height: 0.0609 },
    },
    {
      step: 6,
      guide: "'간편인증'을 눌러주세요.",
      highlight: { x: 0.2338, y: 0.5437, width: 0.2057, height: 0.1606 },
    },
    {
      step: 7,
      guide: "'민간인증서'를 선택해주세요. (예: 카카오, PASS, 네이버 등)",
      highlight: { x: 0.1372, y: 0.268, width: 0.154, height: 0.3178 },
    },
    {
      step: 8,
      guide: "이름을 적는 칸에 본인의 이름을 입력해주세요.",
      highlight: { x: 0.3741, y: 0.371, width: 0.1584, height: 0.0487 },
    },
    {
      step: 9,
      guide: "생년월일 입력 칸에 생년월일 8자리(예: 19920101)를 입력해주세요.",
      highlight: { x: 0.3747, y: 0.4275, width: 0.1596, height: 0.0443 },
    },
    {
      step: 10,
      guide: "휴대폰 번호 입력 칸에 본인의 전화번호를 입력해주세요.",
      highlight: { x: 0.3753, y: 0.4751, width: 0.159, height: 0.0498 },
    },
    {
      step: 11,
      guide: "입력이 모두 끝나면 서비스에 대한 전체 동의를 눌러주세요",
      highlight: { x: 0.4913, y: 0.5637, width: 0.0505, height: 0.0343 },
    },
    {
      step: 12,
      guide: "입력이 모두 끝나면 '인증 요청' 버튼을 눌러주세요.",
      highlight: { x: 0.3734, y: 0.7763, width: 0.1727, height: 0.0465 },
    },
  ],
};
