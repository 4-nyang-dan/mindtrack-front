// 데이터 가져오기(API 추상화: mock/백엔드/AI서버로 추후 수정)
import type { SuggestionPayload } from "../types/suggestion";

// 스위치: 나중에 'backend' 또는 'ai'로 바꾸면 됨
//const SOURCE: "mock" | "backend" | "ai" = "mock";

// 백엔드 엔드포인트(예시). 실제 주소/토큰 정해지면 수정
const BACKEND_BASE = "http://localhost:8080";

// 일단 mock/suggestion.json읽어오기
//export async function fetchMock(): Promise<SuggestionPayload | null> {
//  const res = await fetch("/mock/test.json", { cache: "no-store" });
//  if (!res.ok) return null;
//  return res.json();
//}

/**
 * 최신 Top3 제안 가져오기 (백엔드)
 * - window.api.callJson 사용: main.ts가 Authorization 등 헤더 자동 처리
 */
export async function fetchLatestSuggestions(): Promise<SuggestionPayload | null> {
  const r = await window.api.call(`/api/suggestions/latest`, { method: "GET" });
  if (r.status !== 200) return null;
  return JSON.parse(r.body) as SuggestionPayload;
}
