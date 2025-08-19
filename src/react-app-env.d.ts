/// <reference types="react-scripts" />
interface Window {
  capture: {
    getScreenshot: () => Promise<string>;
    logToMain: (msg: string) => void;
  };
  auth: {
    signup: (userId: string, email: string, password: string) => Promise<{ userId: string; email: string; token: string }>;
    login: (userId: string, password: string) => Promise<{ userId: string; email: string; token: string }>;
    logout: () => Promise<any>;
    me: () => Promise<{ status: number; body: string }>;
  };
  api: {
    call: (
      path: string,
      init?: { method?: string; headers?: any; body?: any }
    ) => Promise<{
      status: number;
      body: string;
      headers: Record<string, string>;
    }>;
    callJson: (path: string, init?: { method?: string; headers?: any; body?: any }) =>            // ✅ 추가
        Promise<{ status: number; body: any; headers: Record<string, string> }>;
    upload: (
      path: string,
      file: { name: string; type: string; buffer: ArrayBuffer },
      fields?: Record<string, string>
    ) => Promise<{
      status: number;
      body: string;
      headers: Record<string, string>;
    }>;

    // SSE 관련
      startSuggestionsStream: () => Promise<any>;
      stopSuggestionsStream: () => Promise<any>;
      onSuggestions: (cb: (payload: any) => void) => () => void;
      onSseError: (cb: (msg: { status: number | null; message: string }) => void) => () => void;
      onHeartbeat: (cb: (data: any) => void) => () => void;
  };
}
