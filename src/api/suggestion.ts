// 데이터 가져오기(API 추상화: mock/백엔드/AI서버로 추후 수정)
import type { SuggestionPayload } from "../types/suggestion";

// 스위치: 나중에 'backend' 또는 'ai'로 바꾸면 됨
//const SOURCE: "mock" | "backend" | "ai" = "mock";

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
  //const r = await window.api.call(`/api/suggestions/latest`, { method: "GET" });
  if (r.status !== 200) {
    throw new Error(`fetch latest top3 question failed: ${r.status} ${r.body}`);
  }
  const data = JSON.parse(r.body) as SuggestionPayload;

  // analysisResult 가 JSON string이라면 파싱
  if (typeof (data as any).analysisResult === "string") {
    try {
      const parsed = JSON.parse((data as any).analysisResult);
      return { ...data, ...parsed };
    } catch {
      return data;
    }
  }

  return data;
}
