"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const API_BASE = process.env.API_BASE ?? "http://localhost:8080";
const APP_NAME = "MindTrack";
const SIZE_AUTH = { width: 1000, height: 700 };
const SIZE_RENDER = { width: 560, height: 120 };
const SAVE_DIR = path.join(__dirname, "../screenshots");
if (!fs.existsSync(SAVE_DIR))
    fs.mkdirSync(SAVE_DIR, { recursive: true });
// -------------------- 로그 --------------------
electron_1.ipcMain.on("LOG_TO_MAIN", (_e, message) => {
    console.log("[From Renderer]", message);
});
// -------------------- 인증 토큰 --------------------
let accessToken = null;
// -------------------- 공통 fetch --------------------
async function apiFetch(pathname, init = {}) {
    if (!accessToken) {
        console.warn(`[apiFetch] JWT 없음 → ${pathname}`);
        // 여기서 throw해도 됨
    }
    const isMultipart = init.body instanceof FormData;
    const headers = new Headers(init.headers || {});
    if (accessToken)
        headers.set("Authorization", `Bearer ${accessToken}`);
    if (!headers.has("Content-Type") && !isMultipart && init.body) {
        headers.set("Content-Type", "application/json");
    }
    let body = init.body;
    if (!isMultipart && body && typeof body !== "string") {
        body = JSON.stringify(body);
    }
    return fetch(`${API_BASE}${pathname}`, { ...init, headers, body });
}
// -------------------- 캡처 --------------------
electron_1.ipcMain.handle("GET_SCREENSHOT", async () => {
    const { size } = electron_1.screen.getPrimaryDisplay();
    const sources = await electron_1.desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: size.width, height: size.height },
    });
    if (!sources.length)
        throw new Error("화면 소스를 가져오지 못했습니다.");
    const pngBuffer = sources[0].thumbnail.toPNG();
    const base64 = pngBuffer.toString("base64");
    //const filePath = path.join(SAVE_DIR, `screenshot-${Date.now()}.png`);
    //fs.writeFileSync(filePath, pngBuffer);
    return `data:image/png;base64,${base64}`;
});
// -------------------- 인증 --------------------
electron_1.ipcMain.handle("AUTH_SIGNUP", async (_e, body) => {
    const r = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok)
        throw new Error(d?.message || `Signup failed: ${r.status}`);
    accessToken = d.token || null; // JWT 저장
    return d;
});
electron_1.ipcMain.handle("AUTH_LOGIN", async (_e, body) => {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok)
        throw new Error(d?.message || `Login failed: ${r.status}`);
    accessToken = d.token || null;
    console.log("[main] 로그인 완료 → accessToken 세팅");
    return d;
});
electron_1.ipcMain.handle("AUTH_LOGOUT", async () => {
    accessToken = null;
    return { ok: true };
});
// -------------------- API 프록시 --------------------
electron_1.ipcMain.handle("API_CALL", async (_e, { path, init }) => {
    const r = await apiFetch(path, init || {});
    const text = await r.text();
    return { status: r.status, body: text, headers: Object.fromEntries(r.headers.entries()) };
});
electron_1.ipcMain.handle("API_UPLOAD", async (_e, { path, file, fields }) => {
    const form = new FormData();
    if (fields)
        for (const [k, v] of Object.entries(fields))
            form.append(k, v);
    const blob = new Blob([Buffer.from(file.buffer)], { type: file.type || "application/octet-stream" });
    form.append("image", new File([blob], file.name, { type: file.type }), file.name);
    const r = await apiFetch(path, { method: "POST", body: form });
    const text = await r.text();
    console.log("[API_UPLOAD] accessToken:", accessToken);
    return { status: r.status, body: text, headers: Object.fromEntries(r.headers.entries()) };
});
// -------------------- 창 생성 --------------------
let win = null;
function createWindow() {
    const preloadPath = electron_1.app.isPackaged
        ? path.join(__dirname, "preload.js")
        : path.join(__dirname, "../dist/preload.js");
    win = new electron_1.BrowserWindow({
        ...SIZE_AUTH,
        frame: true,
        resizable: true,
        backgroundColor: "#0b0d10",
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
}
// -------------------- IPC: 모드 전환 --------------------
electron_1.ipcMain.handle("APP:ENTER_RENDER_MODE", () => {
    if (!win)
        return;
    win.setBounds({ x: 10, y: 10, width: SIZE_RENDER.width, height: SIZE_RENDER.height });
    win.setAlwaysOnTop(true, "floating");
    win.setIgnoreMouseEvents(false);
    win.setResizable(false);
    win.setHasShadow(false);
    win.setBackgroundColor("#00000000");
    win.setOpacity(1);
    win.setFullScreenable(false);
    win.setMenuBarVisibility(false);
    win.setVisibleOnAllWorkspaces(true);
    win.setSkipTaskbar(true);
    win.setFocusable(true);
});
electron_1.ipcMain.handle("APP:EXIT_RENDER_MODE", () => {
    if (!win)
        return;
    win.setBounds({ width: SIZE_AUTH.width, height: SIZE_AUTH.height, x: 100, y: 100 });
    win.setAlwaysOnTop(false);
    win.setResizable(true);
    win.setHasShadow(true);
    win.setBackgroundColor("#0b0d10");
    win.setSkipTaskbar(false);
});
/*function createWindow() {
  const preloadPath = app.isPackaged
    ? path.join(__dirname, "preload.js")
    : path.join(__dirname, "../dist/preload.js");

  const win = new BrowserWindow({
    width: 560,
    height: 120,
    x: 10,
    y: 10,
    frame: false,                     // ✅ 프레임 제거
    transparent: true,                // ✅ 투명 창
    backgroundColor: "#00000000",     // ✅ 완전 투명
    resizable: false,
    movable: true,
    alwaysOnTop: true,                // ✅ 항상 위
    skipTaskbar: true,                // 작업표시줄 숨김(원하면 제거)
    hasShadow: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  win.loadURL("http://localhost:3000");
  win.webContents.openDevTools();
}*/
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
