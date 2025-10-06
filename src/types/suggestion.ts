export interface PredictedQuestion {
  question: string;
}

export interface Suggestion {
  id: string;
  question: string;
  answer?: string;
  confidence?: number;
}

export interface SuggestionPayload {
  createdAt?: number | string;
  suggestions?: Suggestion[];

  // AI 필드
  description?: string;
  predicted_actions?: string[];
  predicted_questions?: (string | PredictedQuestion)[]; // ✅ 둘 다 허용
}
