import { contextBridge, ipcRenderer } from "electron";

console.log("[preload] running...");

// --- 인증 ---
contextBridge.exposeInMainWorld("auth", {
  signup: (userId: string, email: string, password: string) =>
    ipcRenderer.invoke("AUTH_SIGNUP", { userId, email, password }),
  login: (userId: string, password: string) =>
    ipcRenderer.invoke("AUTH_LOGIN", { userId, password }),
  logout: () => ipcRenderer.invoke("AUTH_LOGOUT"),
});

// --- 캡처 ---
contextBridge.exposeInMainWorld("capture", {
  getScreenshot: async () => ipcRenderer.invoke("GET_SCREENSHOT"),
  logToMain: (msg: string) => ipcRenderer.send("LOG_TO_MAIN", msg),
});

// --- 백엔드 API 프록시 ---
contextBridge.exposeInMainWorld("api", {
  call: (path: string, init?: { method?: string; headers?: any; body?: any }) =>
    ipcRenderer.invoke("API_CALL", { path, init }),

  callJson: (path: string, init?: { method?: string; headers?: any; body?: any }) =>
    ipcRenderer.invoke("API_CALL_JSON", { path, init }),

  upload: (
    path: string,
    file: { name: string; type: string; buffer: ArrayBuffer },
    fields?: Record<string, string>
  ) => ipcRenderer.invoke("API_UPLOAD", { path, file, fields }),

  // SSE
  startSuggestionsStream: () => ipcRenderer.invoke("SSE_START"),
  stopSuggestionsStream: () => ipcRenderer.invoke("SSE_STOP"),

  // SSE 리스너
  onSuggestions: (handler: (payload: any) => void) => {
    const fn = (_: any, data: any) => handler(data);
    ipcRenderer.on("SSE_SUGGESTIONS", fn);
    return () => ipcRenderer.removeListener("SSE_SUGGESTIONS", fn);
  },
  onSseError: (cb: (msg: { status: number | null; message: string }) => void) => {
    const fn = (_: any, data: any) => cb(data);
    ipcRenderer.on("SSE_ERROR", fn);
    return () => ipcRenderer.removeListener("SSE_ERROR", fn);
  },
  onHeartbeat: (handler: (d: { ts: number }) => void) => {
    const fn = (_: any, data: any) => handler(data);
    ipcRenderer.on("SSE_HEARTBEAT", fn);
    return () => ipcRenderer.removeListener("SSE_HEARTBEAT", fn);
  },
});

// --- 오버레이 ---
contextBridge.exposeInMainWorld("overlay", {
  show: (data: { boxes: any[]; screenshotPath: string }) =>
    ipcRenderer.send("SHOW_OVERLAY", data),
  hide: () => ipcRenderer.send("HIDE_OVERLAY"),
});

// --- 오버레이 선택 ---
contextBridge.exposeInMainWorld("overlaySelect", {
  show: () => ipcRenderer.send("SHOW_OVERLAY_SELECT"),
  hide: () => ipcRenderer.send("HIDE_OVERLAY_SELECT"),
  onBoxSelected: (handler: (box: any) => void) => {
    const fn = (_: any, data: any) => handler(data);
    ipcRenderer.on("OVERLAY_SELECT_RESULT", fn);
    return () => ipcRenderer.removeListener("OVERLAY_SELECT_RESULT", fn);
  },
});

console.log("[preload] loaded successfully");
