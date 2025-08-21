import { app, BrowserWindow, ipcMain, desktopCapturer, screen, webContents  } from "electron";
import * as path from "path";
import * as fs from "fs";
import { setTimeout as delay } from "timers/promises";
import keytar from "keytar";

const API_BASE = process.env.API_BASE ?? "http://localhost:8080";
const APP_NAME = "MindTrack";

const SAVE_DIR = path.join(__dirname, "../screenshots");
if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

// -------------------- 로그 --------------------
ipcMain.on("LOG_TO_MAIN", (_e, message) => {
  console.log("[From Renderer]", message);
});

// -------------------- 인증 토큰 --------------------
let accessToken: string | null = null;


// ----------- sse 구독 읽어오기 위한 Stream설정
type Stream = { es: any; clients: Set<number> };
let sseStream: Stream | null = null;
const EventSourceModule = require("eventsource");

console.log("typeof EventSourceModule:", typeof EventSourceModule);
console.log("EventSourceModule keys:", Object.keys(EventSourceModule));
console.log("EventSourceModule.default:", typeof EventSourceModule.default);

function startSse() {
  if (sseStream || !accessToken) {
    console.warn("[SSE] connect try failed: accessToken not found");
    return;
  }

  console.log("[SSE] connect start: token =", accessToken);

  const es = new EventSourceModule(`${API_BASE}/api/suggestions/stream?token=${accessToken}`);

  es.addEventListener("suggestions", (ev: any) => {
    try {
      const payload = JSON.parse(ev.data);
      if (!sseStream) {
        throw new Error(`sse suggestions failed: sseStream is null`);
      }
      for (const wcId of sseStream.clients) {
        webContents.fromId(wcId)?.send("SSE_SUGGESTIONS", payload);
        console.log("[SSE] suggestion detection: payload:", payload);
      }
    } catch (e) {
      console.error("[SSE parse]", e);
    }
  });

  es.addEventListener("heartbeat", () => {
    if (!sseStream) {
        throw new Error(`sse suggestions failed: sseStream is null`);
      }
    for (const wcId of sseStream.clients) {
      webContents.fromId(wcId)?.send("SSE_HEARTBEAT", { ts: Date.now() });
    }
  });

  es.onerror = (err: any) => {
    console.warn("[SSE error]", err);
    if (!sseStream) return;
    for (const wcId of sseStream.clients) {
      webContents.fromId(wcId)?.send("SSE_ERROR", {
        status: err?.status || null,
        message: err?.message || String(err)
      });
    }
  };

  sseStream = { es, clients: new Set() };
}

function stopSseIfNoClients() {
  if (sseStream && sseStream.clients.size === 0) {
    try { sseStream.es.close(); } catch {}
    sseStream = null;
  }
}


// -------------------- 공통 fetch --------------------
async function apiFetch(pathname: string, init: any = {}) {
  if (!accessToken) {
    console.warn(`[apiFetch] JWT 없음 → ${pathname}`);
    // 여기서 throw해도 됨
  }

  const isMultipart = init.body instanceof FormData;
  const headers = new Headers(init.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (!headers.has("Content-Type") && !isMultipart && init.body) {
    headers.set("Content-Type", "application/json");
  }

  let body = init.body;
  if (!isMultipart && body && typeof body !== "string") {
    body = JSON.stringify(body);
  }

  return fetch(`${API_BASE}${pathname}`, { ...init, headers, body});
}

// -------------------- 캡처 --------------------
ipcMain.handle("GET_SCREENSHOT", async () => {
  const { size } = screen.getPrimaryDisplay();
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: size.width, height: size.height },
  });
  if (!sources.length) throw new Error("화면 소스를 가져오지 못했습니다.");

  const pngBuffer = sources[0].thumbnail.toPNG();
  const base64 = pngBuffer.toString("base64");

  const filePath = path.join(SAVE_DIR, `screenshot-${Date.now()}.png`);
  fs.writeFileSync(filePath, pngBuffer);

  // N초 뒤 자동 삭제
  (async () => {
    await delay(30_000); // 30초
    fs.promises.unlink(filePath).catch(() => {});
  })();

  return `data:image/png;base64,${base64}`;
});

// -------------------- 인증 --------------------
ipcMain.handle("AUTH_SIGNUP", async (_e, body: { userId: string; email: string; password: string }) => {
  const r = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message || `Signup failed: ${r.status}`);

  accessToken = d.token || null; // JWT 저장
  return d;
});

ipcMain.handle("AUTH_LOGIN", async (_e, body: { userId: string; password: string }) => {
  const r = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message || `Login failed: ${r.status}`);

  accessToken = d.token || null;

  //토큰 바뀌면 SSE를 재연결
  if(sseStream){
    try { sseStream.es.close(); } catch {}
    sseStream = null;
  }
  startSse();
  console.log("[main] 로그인 완료 → accessToken 세팅", accessToken);
  return d;
});

ipcMain.handle("AUTH_LOGOUT", async () => {
  accessToken = null;
  if (sseStream) {
    try { sseStream.es.close(); } catch {}
    sseStream = null;
  }
  stopSseIfNoClients();
  return { ok: true };
});

// -------------------- API 프록시 --------------------
ipcMain.handle("API_CALL", async (_e, { path, init }) => {
  const r = await apiFetch(path, init || {});
  const text = await r.text();
  return { status: r.status, body: text, headers: Object.fromEntries(r.headers.entries()) };
});

ipcMain.handle("API_CALL_JSON", async(_e, {path, init}) => {
  const r = await apiFetch(path, init || {});
  const text = await r.text();
  const ct = r.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? JSON.parse(text || "{}") : text;
  return { status: r.status, body, headers: Object.fromEntries(r.headers.entries())};
});

ipcMain.handle("API_UPLOAD", async (_e, { path, file, fields }: { path: string; file: { name: string; type?: string; buffer: ArrayBuffer }; fields?: Record<string, string> }) => {
  const form = new FormData();
  if (fields) for (const [k, v] of Object.entries(fields)) form.append(k, v);

  const blob = new Blob([Buffer.from(file.buffer)], { type: file.type || "application/octet-stream" });
  form.append("image", new File([blob], file.name, { type: file.type }), file.name);

  const r = await apiFetch(path, { method: "POST", body: form });
  const text = await r.text();

  console.log("[API_UPLOAD] accessToken:", accessToken);
  return { status: r.status, body: text, headers: Object.fromEntries(r.headers.entries()) };
});

ipcMain.handle("SSE_START", async (e) => {
  startSse();
  if (sseStream) sseStream.clients.add(e.sender.id);
  return { ok: true };
});

ipcMain.handle("SSE_STOP", async (e) => {
  if (sseStream) {
    sseStream.clients.delete(e.sender.id);
    stopSseIfNoClients();
  }
  return { ok: true };
});

// -------------------- 창 생성 --------------------
function createWindow() {
  const preloadPath = app.isPackaged
    ? path.join(__dirname, "preload.js")
    : path.join(__dirname, "../dist/preload.js");

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
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

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
