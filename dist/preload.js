"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log("[preload] running...");
// --- 인증 ---
electron_1.contextBridge.exposeInMainWorld("auth", {
    signup: (userId, email, password) => electron_1.ipcRenderer.invoke("AUTH_SIGNUP", { userId, email, password }),
    login: (userId, password) => electron_1.ipcRenderer.invoke("AUTH_LOGIN", { userId, password }),
    logout: () => electron_1.ipcRenderer.invoke("AUTH_LOGOUT"),
});
// --- 캡처 ---
electron_1.contextBridge.exposeInMainWorld("capture", {
    getScreenshot: async () => electron_1.ipcRenderer.invoke("GET_SCREENSHOT"),
    logToMain: (msg) => electron_1.ipcRenderer.send("LOG_TO_MAIN", msg),
});
// --- 백엔드 API 프록시 ---
electron_1.contextBridge.exposeInMainWorld("api", {
    call: (path, init) => electron_1.ipcRenderer.invoke("API_CALL", { path, init }),
    callJson: (path, init) => electron_1.ipcRenderer.invoke("API_CALL_JSON", { path, init }),
    upload: (path, file, fields) => electron_1.ipcRenderer.invoke("API_UPLOAD", { path, file, fields }),
    // SSE
    startSuggestionsStream: () => electron_1.ipcRenderer.invoke("SSE_START"),
    stopSuggestionsStream: () => electron_1.ipcRenderer.invoke("SSE_STOP"),
    // SSE 리스너
    onSuggestions: (handler) => {
        const fn = (_, data) => handler(data);
        electron_1.ipcRenderer.on("SSE_SUGGESTIONS", fn);
        return () => electron_1.ipcRenderer.removeListener("SSE_SUGGESTIONS", fn);
    },
    onSseError: (cb) => {
        const fn = (_, data) => cb(data);
        electron_1.ipcRenderer.on("SSE_ERROR", fn);
        return () => electron_1.ipcRenderer.removeListener("SSE_ERROR", fn);
    },
    onHeartbeat: (handler) => {
        const fn = (_, data) => handler(data);
        electron_1.ipcRenderer.on("SSE_HEARTBEAT", fn);
        return () => electron_1.ipcRenderer.removeListener("SSE_HEARTBEAT", fn);
    },
});
// --- 오버레이 ---
electron_1.contextBridge.exposeInMainWorld("overlay", {
    show: (data) => electron_1.ipcRenderer.send("SHOW_OVERLAY", data),
    hide: () => electron_1.ipcRenderer.send("HIDE_OVERLAY"),
});
// --- 오버레이 선택 ---
electron_1.contextBridge.exposeInMainWorld("overlaySelect", {
    show: () => electron_1.ipcRenderer.send("SHOW_OVERLAY_SELECT"),
    hide: () => electron_1.ipcRenderer.send("HIDE_OVERLAY_SELECT"),
    onBoxSelected: (handler) => {
        const fn = (_, data) => handler(data);
        electron_1.ipcRenderer.on("OVERLAY_SELECT_RESULT", fn);
        return () => electron_1.ipcRenderer.removeListener("OVERLAY_SELECT_RESULT", fn);
    },
});
console.log("[preload] loaded successfully");
