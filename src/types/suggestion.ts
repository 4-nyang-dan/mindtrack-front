//타입 정의
export type Suggestion = {
  id: string;
  question: string;
  answer: string;
  confidence?: number; // AI 모델이 이 질문/답변이 현재 상황과 얼마나 관련 있다고 생각하는가
};

export type SuggestionPayload = {
  userId: string;
  createdAt: string; // ISO
  suggestions: Suggestion[];
};
