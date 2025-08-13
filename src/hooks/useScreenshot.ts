// src/hooks/useScreenshot.ts
import { useState, useEffect, useRef } from "react";
import { computeSSIM } from "../utils/imageUtils";
import { uploadScreenshotToBackend } from "../api/sampling"; // ← 업로드 유틸 (앞서 만든 것)
import { useAuth } from "../components/auth/AuthContext";       // ← 로그인한 userId 읽기

declare global {
  interface Window {
    capture: {
      getScreenshot: () => Promise<string>;
      logToMain: (msg: string) => void;
    };
  }
}

const SSIM_THRESHOLD = 0.9;
const INTERVAL_MS = 1500; // 1.5초 주기

export function useScreenshot() {
  const { user } = useAuth(); // 로그인 정보
  const [capturing, setCapturing] = useState(false);
  const prevImageRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null); // ✅ 브라우저 환경에선 number
  const busyRef = useRef(false);                // ✅ 중복 실행 방지

  useEffect(() => {
    if (!capturing) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      prevImageRef.current = null;
      busyRef.current = false;
      return;
    }

    timerRef.current = window.setInterval(async () => {
      if (busyRef.current) return; // 이미 실행 중이면 스킵
      busyRef.current = true;

      try {
        const currentBase64 = await window.capture?.getScreenshot?.();
        if (!currentBase64) return;

        if (prevImageRef.current) {
          const t0 = performance.now();
          const ssim = await computeSSIM(prevImageRef.current, currentBase64);
          const t1 = performance.now();
          console.log(`SSIM similarity: ${ssim.toFixed(3)} (계산 ${(t1 - t0).toFixed(1)} ms)`);

          // 유사하면 업로드 스킵
          if (ssim >= SSIM_THRESHOLD) {
            window.capture?.logToMain?.(`유사도 ${ssim.toFixed(3)} → 업로드 생략`);
            return;
          }
        }

        // 변화 감지 → 업로드
        prevImageRef.current = currentBase64;

        if (!user?.userId) {
          console.warn("로그인 필요: userId 없음 → 업로드 스킵");
          return;
        }

        const resp = await uploadScreenshotToBackend(currentBase64, user.userId);
        window.capture?.logToMain?.(`업로드 성공: ${JSON.stringify(resp)}`);
      } catch (err) {
        console.error("스크린샷/SSIM/업로드 중 에러:", err);
      } finally {
        busyRef.current = false;
      }
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      busyRef.current = false;
    };
  }, [capturing, user?.userId]);

  return {
    capturing,
    startCapture: () => setCapturing(true),
    stopCapture: () => setCapturing(false),
  };
}
