"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// contextBridge를 통해 안전하게 렌더러에게 메인 프로세스 기능 노출
console.log("-- preload script is running in Electron --");
// --- 인증/프록시  ---
electron_1.contextBridge.exposeInMainWorld("auth", {
    signup: (userId, email, password) => electron_1.ipcRenderer.invoke("AUTH_SIGNUP", { userId, email, password }),
    login: (userId, password) => electron_1.ipcRenderer.invoke("AUTH_LOGIN", { userId, password }),
    logout: () => electron_1.ipcRenderer.invoke("AUTH_LOGOUT"),
});
// 렌더러에게 받은 캡처 요청을 ipc를 통해 메인 프로세스에게 전달.
/*contextBridge.exposeInMainWorld("capture", {
  getScreenshot: async () => {
    const filePath = await ipcRenderer.invoke("GET_SCREENSHOT");
    console.log("ipcRenderer invoked");
    //console.log("Save filesto folder successfully:", filePath);
    // main 프로세스로 메시지 전송
    //return await ipcRenderer.invoke("GET_SCREENSHOT");

    return filePath;
  },
  logToMain: (msg: string) => ipcRenderer.send("LOG_TO_MAIN", msg),
});*/
electron_1.contextBridge.exposeInMainWorld("capture", {
    getScreenshot: async () => electron_1.ipcRenderer.invoke("GET_SCREENSHOT"),
    logToMain: (msg) => electron_1.ipcRenderer.send("LOG_TO_MAIN", msg),
});
/**
 * 백엔드 일반 호출 (메인이 HTTP 호출을 대행)
 * - API_CALL: 임의의 fetch 프록시
 * - API_UPLOAD: 파일 업로드 프록시 (form-data 구성은 메인에서)
 *
 * 권장: 메인 프로세스가 로그인 성공 시 받은 JWT를 보관하고,
 *      API_CALL/API_UPLOAD 프록시에 Authorization 헤더를 자동 부착.
 */
electron_1.contextBridge.exposeInMainWorld("api", {
    call: (path, init) => electron_1.ipcRenderer.invoke("API_CALL", { path, init }),
    upload: (path, file, fields) => electron_1.ipcRenderer.invoke("API_UPLOAD", { path, file, fields }),
});
console.log("[preload] loaded");
