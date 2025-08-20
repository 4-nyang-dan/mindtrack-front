//top3 구독 훅(초기 fetch + 폴링/SSE 스위치 가능)

import { useEffect, useState } from "react";
import type { SuggestionPayload } from "../types/suggestion";
import { fetchLatestSuggestions } from "../api/suggestion";
import { useAuth } from "../components/auth/AuthContext";

export function useSuggestions() {
  const { user } = useAuth(); // 필요 시 userId로 권한 체크
  const [payload, setPayload] = useState<SuggestionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 초기 1회 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await fetchLatestSuggestions();
        if (mounted && p) setPayload(p);
      } catch (e: any) {
        if (mounted) setError(String(e?.message || e));
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 폴링 구독 (SSE로 바꿀 때 여기만 교체)
  //useEffect(() => {
  //  const unsub = subscribeLatestSuggestions(sessionId, (p) => setPayload(p));
  //  return () => unsub();
  //}, [sessionId]);
  // SSE 구독
  useEffect(() => {
    let off1: (() => void) | null = null;
    let off2: (() => void) | null = null;
    let off3: (() => void) | null = null;

    (async () => {
      await window.api.startSuggestionsStream();
      off1 = window.api.onSuggestions((p) => setPayload(p as SuggestionPayload));
      off2 = window.api.onSseError((msg) => {
        console.warn("[SSE_ERROR]", msg.status, msg.message);
      });
      off3 = window.api.onHeartbeat(() => {/* 필요 시 표시 */});
    })();

    return () => {
      off1?.(); off2?.(); off3?.();
      window.api.stopSuggestionsStream().catch(() => {});
    };
  }, []);

  return { payload, error, user };
}
