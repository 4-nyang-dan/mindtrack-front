import { app, BrowserWindow, ipcMain, desktopCapturer, screen } from "electron";
import * as path from "path";
import * as fs from "fs";
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

  return fetch(`${API_BASE}${pathname}`, { ...init, headers, body });
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
  console.log("[main] 로그인 완료 → accessToken 세팅");
  return d;
});

ipcMain.handle("AUTH_LOGOUT", async () => {
  accessToken = null;
  return { ok: true };
});

// -------------------- API 프록시 --------------------
ipcMain.handle("API_CALL", async (_e, { path, init }) => {
  const r = await apiFetch(path, init || {});
  const text = await r.text();
  return { status: r.status, body: text, headers: Object.fromEntries(r.headers.entries()) };
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
