import {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  screen,
  webContents,
} from "electron";
import * as path from "path";
import * as fs from "fs";
import { setTimeout as delay } from "timers/promises";
import keytar from "keytar";

const API_BASE = process.env.API_BASE ?? "http://localhost:8080";
const APP_NAME = "MindTrack";

ipcMain.on("LOG_TO_MAIN", (_e, message) => {
  console.log("[From Renderer]", message);
});

let accessToken: string | null = null;

// -------------------- SSE --------------------
type Stream = { es: any; clients: Set<number> };
let sseStream: Stream | null = null;
const EventSourceModule = require("eventsource");

function startSse() {
  if (sseStream || !accessToken) {
    console.warn("[SSE] connect try failed: accessToken not found");
    return;
  }

  const es = new EventSourceModule(
    `${API_BASE}/api/suggestions/stream?token=${accessToken}`
  );

  es.addEventListener("suggestions", (ev: any) => {
    try {
      const payload = JSON.parse(ev.data);
      if (!sseStream) throw new Error("sseStream is null");
      for (const wcId of sseStream.clients) {
        webContents.fromId(wcId)?.send("SSE_SUGGESTIONS", payload);
      }
    } catch (e) {
      console.error("[SSE parse]", e);
    }
  });

  es.addEventListener("heartbeat", () => {
    if (!sseStream) return;
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
    } catch {}
    sseStream = null;
  }
}

// -------------------- 공통 fetch --------------------
async function apiFetch(pathname: string, init: any = {}) {
  if (!accessToken)
    console.warn(`[apiFetch] JWT 없음 → ${pathname}`);

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
  return `data:image/png;base64,${base64}`;
});


// -------------------- 인증 --------------------
ipcMain.handle(
  "AUTH_SIGNUP",
  async (_e, body: { userId: string; email: string; password: string }) => {
    const r = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.message || `Signup failed: ${r.status}`);
    accessToken = d.token || null;
    return d;
  }
);

ipcMain.handle(
  "AUTH_LOGIN",
  async (_e, body: { userId: string; password: string }) => {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.message || `Login failed: ${r.status}`);

    accessToken = d.token || null;
    if (sseStream) {
      try {
        sseStream.es.close();
      } catch {}
      sseStream = null;
    }
    startSse();
    return d;
  }
);

ipcMain.handle("AUTH_LOGOUT", async () => {
  accessToken = null;
  if (sseStream) {
    try {
      sseStream.es.close();
    } catch {}
    sseStream = null;
  }
  stopSseIfNoClients();
  return { ok: true };
});

// -------------------- API --------------------
ipcMain.handle("API_CALL", async (_e, { path, init }) => {
  const r = await apiFetch(path, init || {});
  const text = await r.text();
  return {
    status: r.status,
    body: text,
    headers: Object.fromEntries(r.headers.entries()),
  };
});

ipcMain.handle("API_CALL_JSON", async (_e, { path, init }) => {
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

ipcMain.handle(
  "API_UPLOAD",
  async (
    _e,
    {
      path,
      file,
      fields,
    }: {
      path: string;
      file: { name: string; type?: string; buffer: ArrayBuffer };
      fields?: Record<string, string>;
    }
  ) => {
    const form = new FormData();
    if (fields)
      for (const [k, v] of Object.entries(fields)) form.append(k, v);

    const blob = new Blob([file.buffer], {
      type: file.type || "application/octet-stream",
    });
    form.append(
      "image",
      new File([blob], file.name, { type: file.type }),
      file.name
    );

    const r = await apiFetch(path, { method: "POST", body: form });
    const text = await r.text();
    return {
      status: r.status,
      body: text,
      headers: Object.fromEntries(r.headers.entries()),
    };
  }
);

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

// -------------------- 메인 윈도우 --------------------
let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = app.isPackaged
    ? path.join(__dirname, "preload.js")
    : path.join(__dirname, "../dist/preload.js");

  const winWidth = 512;
  const winHeight = 1200;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x: displayX, y: displayY, width: displayWidth, height: displayHeight } = primaryDisplay.workArea;
  const winX = displayX + displayWidth - winWidth;
  const winY = displayY;

  mainWindow = new BrowserWindow({
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
ipcMain.on("SHOW_OVERLAY", (_e, { boxes, screenshotPath }) => {
  console.log("SHOW_OVERLAY 호출됨", boxes);

  if (overlayWindow) overlayWindow.close();
  const mainBounds = mainWindow?.getBounds();

  overlayWindow = new BrowserWindow({
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

  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  const overlayFile = path.join(__dirname, "../public/overlay.html");
  overlayWindow.loadFile(overlayFile);

  overlayWindow.webContents.once("did-finish-load", () => {
    overlayWindow?.webContents.send("RENDER_OVERLAY", {
      boxes,
      screenshotPath,
      mainBounds,
    });

    overlayWindow!.setAlwaysOnTop(true, "screen-saver");
    overlayWindow!.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    overlayWindow!.showInactive();
  });
});

ipcMain.on("HIDE_OVERLAY", () => {
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }
});

// -------------------- App Lifecycle --------------------
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
