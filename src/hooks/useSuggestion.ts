import { useEffect, useState } from "react";
import type { SuggestionPayload } from "../types/suggestion";
import { fetchLatestSuggestions } from "../api/suggestion";
import { useAuth } from "../components/auth/AuthContext";

export function useSuggestions() {
  const { user } = useAuth();
  const [payload, setPayload] = useState<SuggestionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // (선택) 초기 1회 로드 — 토큰 있을 때만
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.token) return;
      try {
        const p = await fetchLatestSuggestions();
        if (mounted && p) setPayload(p);
      } catch (e: any) {
        if (mounted) setError(String(e?.message || e));
      }
    })();
    return () => { mounted = false; };
  }, [user?.token]); // ✅ 토큰 생기면 다시 시도

  // ✅ SSE 구독: 토큰 바뀔 때마다 재연결
  useEffect(() => {
    // 토큰 없으면 구독 안 함
    if (!user?.token) return;

    let off1: (() => void) | null = null;
    let off2: (() => void) | null = null;
    let off3: (() => void) | null = null;
    let stopped = false;

    (async () => {
      try {
        // 혹시 이전에 떠있던 스트림 정리
        await window.api.stopSuggestionsStream().catch(() => {});
        // 새 토큰으로 시작
        await window.api.startSuggestionsStream();

        off1 = window.api.onSuggestions((p) =>
          setPayload(p as SuggestionPayload)
        );
        off2 = window.api.onSseError((msg) => {
          console.warn("[SSE_ERROR]", msg.status, msg.message);
        });
        off3 = window.api.onHeartbeat(() => {
          // 필요 시 UI 표시
        });
      } catch (e) {
        console.warn("[SSE_START_FAILED]", e);
      }
    })();

    return () => {
      if (stopped) return;
      stopped = true;
      off1?.(); off2?.(); off3?.();
      window.api.stopSuggestionsStream().catch(() => {});
    };
  }, [user?.token]); // ✅ 핵심: 토큰이 의존성
  //           ^^^^^

  return { payload, error, user };
}
