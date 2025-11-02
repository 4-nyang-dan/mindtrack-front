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
const API_BASE = process.env.API_BASE ?? "http://localhost:8080";
const APP_NAME = "MindTrack";
electron_1.ipcMain.on("LOG_TO_MAIN", (_e, message) => {
    console.log("[From Renderer]", message);
});
let accessToken = null;
let sseStream = null;
const EventSourceModule = require("eventsource");
function startSse() {
    if (sseStream || !accessToken) {
        console.warn("[SSE] connect try failed: accessToken not found");
        return;
    }
    const es = new EventSourceModule(`${API_BASE}/api/suggestions/stream?token=${accessToken}`);
    es.addEventListener("suggestions", (ev) => {
        try {
            const payload = JSON.parse(ev.data);
            if (!sseStream)
                throw new Error("sseStream is null");
            for (const wcId of sseStream.clients) {
                electron_1.webContents.fromId(wcId)?.send("SSE_SUGGESTIONS", payload);
            }
        }
        catch (e) {
            console.error("[SSE parse]", e);
        }
    });
    es.addEventListener("heartbeat", () => {
        if (!sseStream)
            return;
        for (const wcId of sseStream.clients) {
            electron_1.webContents.fromId(wcId)?.send("SSE_HEARTBEAT", { ts: Date.now() });
        }
    });
    es.onerror = (err) => {
        console.warn("[SSE error]", err);
        if (!sseStream)
            return;
        for (const wcId of sseStream.clients) {
            electron_1.webContents.fromId(wcId)?.send("SSE_ERROR", {
                status: err?.status || null,
                message: err?.message || String(err),
            });
        }
    };
    sseStream = { es, clients: new Set() };
}
function stopSseIfNoClients() {
    if (sseStream && sseStream.clients.size === 0) {
        try {
            sseStream.es.close();
        }
        catch { }
        sseStream = null;
    }
}
// -------------------- 공통 fetch --------------------
async function apiFetch(pathname, init = {}) {
    if (!accessToken)
        console.warn(`[apiFetch] JWT 없음 → ${pathname}`);
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
    accessToken = d.token || null;
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
    if (sseStream) {
        try {
            sseStream.es.close();
        }
        catch { }
        sseStream = null;
    }
    startSse();
    return d;
});
electron_1.ipcMain.handle("AUTH_LOGOUT", async () => {
    accessToken = null;
    if (sseStream) {
        try {
            sseStream.es.close();
        }
        catch { }
        sseStream = null;
    }
    stopSseIfNoClients();
    return { ok: true };
});
// -------------------- API --------------------
electron_1.ipcMain.handle("API_CALL", async (_e, { path, init }) => {
    const r = await apiFetch(path, init || {});
    const text = await r.text();
    return {
        status: r.status,
        body: text,
        headers: Object.fromEntries(r.headers.entries()),
    };
});
electron_1.ipcMain.handle("API_CALL_JSON", async (_e, { path, init }) => {
    const r = await apiFetch(path, init || {});
    const text = await r.text();
    const ct = r.headers.get("content-type") || "";
    const body = ct.includes("application/json")
        ? JSON.parse(text || "{}")
        : text;
    return {
        status: r.status,
        body,
        headers: Object.fromEntries(r.headers.entries()),
    };
});
electron_1.ipcMain.handle("API_UPLOAD", async (_e, { path, file, fields, }) => {
    const form = new FormData();
    if (fields)
        for (const [k, v] of Object.entries(fields))
            form.append(k, v);
    const blob = new Blob([file.buffer], {
        type: file.type || "application/octet-stream",
    });
    form.append("image", new File([blob], file.name, { type: file.type }), file.name);
    const r = await apiFetch(path, { method: "POST", body: form });
    const text = await r.text();
    return {
        status: r.status,
        body: text,
        headers: Object.fromEntries(r.headers.entries()),
    };
});
electron_1.ipcMain.handle("SSE_START", async (e) => {
    startSse();
    if (sseStream)
        sseStream.clients.add(e.sender.id);
    return { ok: true };
});
electron_1.ipcMain.handle("SSE_STOP", async (e) => {
    if (sseStream) {
        sseStream.clients.delete(e.sender.id);
        stopSseIfNoClients();
    }
    return { ok: true };
});
// -------------------- 메인 윈도우 --------------------
let mainWindow = null;
let overlayWindow = null;
function createWindow() {
    const preloadPath = electron_1.app.isPackaged
        ? path.join(__dirname, "preload.js")
        : path.join(__dirname, "../dist/preload.js");
    const winWidth = 512;
    const winHeight = 1200;
    const primaryDisplay = electron_1.screen.getPrimaryDisplay();
    const { x: displayX, y: displayY, width: displayWidth, height: displayHeight, } = primaryDisplay.workArea;
    const winX = displayX + displayWidth - winWidth;
    const winY = displayY;
    mainWindow = new electron_1.BrowserWindow({
        x: winX,
        y: winY,
        width: winWidth,
        height: winHeight,
        resizable: false,
        movable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.removeMenu();
    mainWindow.loadURL("http://localhost:3000");
    // mainWindow.webContents.openDevTools();
}
// -------------------- Overlay 윈도우 --------------------
electron_1.ipcMain.on("SHOW_OVERLAY", (_e, { boxes, screenshotPath }) => {
    if (overlayWindow)
        overlayWindow.close();
    overlayWindow = new electron_1.BrowserWindow({
        transparent: true,
        frame: false,
        fullscreen: true,
        hasShadow: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: false,
        resizable: false,
        movable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // ✅ 클릭 통과 (밑의 창 클릭 가능)
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    const overlayFile = path.join(__dirname, "../public/overlay.html");
    overlayWindow.loadFile(overlayFile);
    overlayWindow.webContents.once("did-finish-load", () => {
        overlayWindow?.webContents.send("RENDER_OVERLAY", {
            boxes,
            screenshotPath,
        });
        overlayWindow.setAlwaysOnTop(true, "screen-saver");
        overlayWindow.setVisibleOnAllWorkspaces(true, {
            visibleOnFullScreen: true,
        });
        overlayWindow.showInactive();
    });
});
electron_1.ipcMain.on("HIDE_OVERLAY", () => {
    if (overlayWindow) {
        overlayWindow.close();
        overlayWindow = null;
    }
});
// ✅ 새 overlay2.html (영역 선택 전용)
let overlaySelectWindow = null;
electron_1.ipcMain.on("SHOW_OVERLAY_SELECT", () => {
    if (overlaySelectWindow)
        overlaySelectWindow.close();
    overlaySelectWindow = new electron_1.BrowserWindow({
        transparent: true,
        frame: false,
        fullscreen: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // overlay2.html 로드
    const overlayFile = path.join(__dirname, "../public/overlay2.html");
    overlaySelectWindow.loadFile(overlayFile);
    overlaySelectWindow.once("ready-to-show", () => {
        overlaySelectWindow.show();
    });
});
// ✅ ESC 또는 드래그 완료 시 닫기
electron_1.ipcMain.on("HIDE_OVERLAY_SELECT", () => {
    if (overlaySelectWindow) {
        overlaySelectWindow.close();
        overlaySelectWindow = null;
    }
});
// ✅ overlay2에서 전송된 박스 좌표 수신
electron_1.ipcMain.on("BOX_SELECTED_FROM_OVERLAY_SELECT", (_e, data) => {
    console.log("📦 선택된 비율 좌표:", data);
    // React(Renderer)에 전달
    mainWindow?.webContents.send("OVERLAY_SELECT_RESULT", data);
});
// -------------------- App Lifecycle --------------------
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
