// types/suggestion.ts
export interface Suggestion {
  id: string;
  question: string;
  answer?: string;
  confidence?: number;
}

export interface SuggestionPayload {
  createdAt?: number | string;
  suggestions?: Suggestion[];

  // AI 추가 필드
  description?: string;               // 현재 상황 요약
  predicted_actions?: string[];       // 앞으로 할 일
  predicted_questions?: string[];     // 예상 질문
}
