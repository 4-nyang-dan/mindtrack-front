# MindTrack Frontend (Electron + React)

사용자의 화면을 캡쳐하여 **프론트 1차 유사도 필터링** → **백엔드 업로드(샘플링/캐시/재분석 예약)** → **AI 분석 결과를 SSE로 실시간 수신** → **UI에 질문/답변 표시** 까지를 담당하는 클라이언트 앱입니다.

> **핵심 포인트**
> - Electron Main에서 데스크탑 화면 캡쳐
> - Renderer(React)에서 `useScreenshot` 훅으로 **SSIM 1차 필터(클라이언트 측)** 후 변화가 의미 있을 때만 업로드
> - Main에서 **SSE**(EventSource) 구독 후, Renderer로 전달
> - JWT는 Main 프로세스가 보관하고, 모든 API 호출을 프록시

---

## 목차
- [주요 기능](#주요-기능)
- [아키텍처 개요](#아키텍처-개요)
- [폴더 구조](#폴더-구조)
- [실행/빌드](#실행빌드)
- [데이터 흐름](#데이터-흐름)
- [프론트 1차 유사도 필터링(SSIM)](#프론트-1차-유사도-필터링ssim)
- [SSE 구독](#sse-구독)
- [노출 API(Preload)](#노출-apipreload)
- [백엔드 연동 API](#백엔드-연동-api)

---

## 주요 기능
1. **초기 진입 화면**: 회원가입/로그인
2. **메인 화면**: 화면 캡쳐 **시작/중지** 제어
3. **캡쳐 시작 시**: 프론트–백엔드–AI 서버를 통한 이미지 **샘플링/분석 파이프라인** 동작
4. **SSE 수신**: 백엔드가 Publish한 이벤트를 구독 → 실시간 질문/답변을 UI에 표시

---

## 아키텍처 개요

~~~mermaid
flowchart LR
  subgraph FE
    R["Renderer - React"]
    P["Preload - contextBridge"]
    M["Main - Electron"]
  end

  BE["Spring Boot API"]
  AI["FastAPI AI Server"]
  DB["Postgres"]

  R -->|window.auth<br/>window.api<br/>window.capture| P
  P -->|IPC - ipcRenderer| M
  M -->|HTTP proxy + JWT| BE
  M -->|SSE - EventSource| BE
  BE --> AI
  AI -->|INSERT results| DB
  DB -->|NOTIFY suggestions_channel| BE
  BE -->|SSE publish| M
  M -->|IPC: SSE_SUGGESTIONS<br/>SSE_HEARTBEAT<br/>SSE_ERROR| R
~~~

### 프론트 기준 동작 요약
- **Renderer(React)**  
  - `useScreenshot` 훅으로 주기 캡쳐 → **클라이언트 1차 SSIM 필터**(유사도 높으면 업로드 생략)  
  - `SuggestionsOverlay`가 **실시간 질문/답변**을 표시
- **Preload(contextBridge)**  
  - `window.auth`, `window.api`, `window.capture` 등 **안전한 브릿지 제공**
- **Main(Electron)**  
  - **화면 캡쳐** 수행, **JWT 보관**, **HTTP 프록시(Authorization 자동부착)**  
  - **SSE(EventSource)** 구독 후, **IPC로 Renderer에 브로드캐스트**
- **Backend/AI/DB**  
  - 업로드된 스크린샷 → 백엔드 2·3차 샘플링 → AI 분석  
  - Postgres NOTIFY → 백엔드 SSE publish → Main 수신 → Renderer 표시
---

## 폴더 구조
~~~
frontend
├─ electron/
│  ├─ main.ts       # 캡쳐/인증/SSE/프록시 관장 (Main 프로세스)
│  └─ preload.ts    # Renderer에 안전하게 API 노출
├─ src/
│  ├─ api/
│  │  ├─ sampling.ts      # 업로드 유틸
│  │  └─ suggestion.ts    # 최신 제안 조회
│  ├─ components/
│  │  ├─ auth/
│  │  │  ├─ AuthContext.tsx
│  │  │  ├─ LoginForm.tsx
│  │  │  └─ SignupForm.tsx
│  │  ├─ CaptureControls.tsx
│  │  └─ SuggestionOverlay.tsx
│  ├─ hooks/
│  │  ├─ useScreenshot.ts   # 캡쳐 루프 + 프론트 SSIM 필터
│  │  └─ useSuggestion.ts   # 최신결과 로드 + SSE 구독
│  ├─ types/
│  │  └─ suggestion.ts
│  ├─ utils/
│  │  ├─ dataUrl.ts
│  │  └─ imageUtils.ts      # SSIM 계산 유틸
│  ├─ App.tsx
│  └─ styles.css
├─ public/
└─ package.json
~~~

---

## 실행/빌드
```bash
# 의존성 설치
npm install

# 프로덕션 빌드(ts파일을 js파일로) **필수!**
npm run build-main

# React Browser 무시 Start
set BROWSER=none&& npm start

# electron 프로그램 Start
npx electron .

```

---

## 데이터 흐름

### 1) 인증 + SSE 세션 수립
~~~mermaid
sequenceDiagram
  participant UI as Renderer(UI)
  participant PRE as Preload
  participant MAIN as Electron Main
  participant API as Backend API

  UI->>PRE: window.auth.login(userId,pw)
  PRE->>MAIN: IPC AUTH_LOGIN
  MAIN->>API: POST /api/auth/login
  API-->>MAIN: { token, userId, email }
  MAIN-->>PRE: 토큰 저장 완료
  PRE-->>UI: 로그인 완료
  MAIN->>API: GET /api/suggestions/stream?token=JWT (EventSource)
  API-->>MAIN: SSE 연결 수립
~~~

### 2) 캡쳐 + 프론트 1차 유사도 필터 + 업로드
~~~mermaid
sequenceDiagram
  participant UI as Renderer
  participant PRE as Preload
  participant MAIN as Electron Main
  participant API as Backend

  UI->>PRE: window.capture.getScreenshot()
  PRE->>MAIN: IPC GET_SCREENSHOT
  MAIN-->>PRE: base64 dataURL
  PRE-->>UI: base64 dataURL
  UI->>UI: computeSSIM(prev, curr)
  alt SSIM < 0.9 (변화 큼)
    UI->>PRE: window.api.upload("/upload-screenshot", file, {userId})
    PRE->>MAIN: IPC API_UPLOAD
    MAIN->>API: POST /upload-screenshot (multipart)
    API-->>MAIN: {currentImageId...} 또는 재분석 예약 응답
    MAIN-->>PRE: 응답
    PRE-->>UI: 응답
  else 유사해서 스킵
    UI->>UI: 업로드 생략
  end
~~~

### 3) SSE 실시간 수신 → UI 갱신
~~~mermaid
sequenceDiagram
  participant API as Backend
  participant MAIN as Electron Main
  participant UI as Renderer

  API-->>MAIN: SSE "heartbeat"/"suggestions"
  MAIN->>UI: IPC SSE_HEARTBEAT / SSE_SUGGESTIONS
  UI->>UI: SuggestionOverlay 상태 갱신
~~~

---

## 프론트 1차 유사도 필터링(SSIM)
- 훅: `src/hooks/useScreenshot.ts`
- 주기: `INTERVAL_MS = 1500ms`
- 임계치: `SSIM_THRESHOLD = 0.9`
- 처리:
  - 직전 캡쳐본과 현재 캡쳐본의 **SSIM** 계산
  - **0.9 이상(매우 유사)** 이면 업로드 **생략**
  - **0.9 미만(눈에 띄는 변화)** 이면 **업로드 수행**
- 백엔드의 2·3차 샘플링(dHash/SSIM) 이전에 **트래픽/부하를 1차로 감소**

---

## SSE 구독
- Main 프로세스가 `EventSource`로 `/api/suggestions/stream?token=JWT` 연결
- 이벤트 종류:
  - `heartbeat` : 연결 유지 알림
  - `suggestions` : `SuggestionPayload` 전체
- Main → Renderer로 IPC 브로드캐스트:
  - `SSE_SUGGESTIONS`, `SSE_HEARTBEAT`, `SSE_ERROR`
- Renderer에서는 `useSuggestions()` 훅이 구독/해제 관리

---

## 노출 API(Preload)
`preload.ts`에서 `contextBridge`로 안전하게 노출:

- `window.auth`
  - `signup(userId,email,password)`
  - `login(userId,password)` → Main이 JWT를 보관하고 SSE 재연결
  - `logout()`
- `window.capture`
  - `getScreenshot()` : Main이 데스크탑 캡쳐 후 base64 반환
  - `logToMain(msg)`
- `window.api`
  - `call(path, init?)` / `callJson(path, init?)` : **JWT 자동 첨부** 프록시
  - `upload(path, file, fields?)` : multipart 업로드 프록시
  - SSE 제어/리스너: `startSuggestionsStream()`, `stopSuggestionsStream()`, `onSuggestions(cb)`, `onSseError(cb)`, `onHeartbeat(cb)`

> **보안**: JWT는 **Renderer가 아닌 Main**에서 관리하여 노출 최소화

---

## 백엔드 연동 API
- **인증**
  - `POST /api/auth/signup` → `{ token, userId, email }`
  - `POST /api/auth/login` → `{ token, userId, email }`
- **스크린샷 업로드**
  - `POST /upload-screenshot` (multipart: `image` 파일 + `userId` 필드)
  - 응답: 신규 `{ currentImageId }` 또는 유사→재분석 예약 `{ prevImageId, similarity, ... }`
- **최신 제안 조회**
  - `GET /api/suggestions/latest` → `SuggestionPayload`
- **SSE 스트림**
  - `GET /api/suggestions/stream?token=JWT` (EventSource)

---

## UI 스냅샷 구성 (핵심 컴포넌트)
- `AuthCard` : 로그인 + 회원가입 모달
- `CaptureControls` : 시작/정지 버튼
- `SuggestionsOverlay` : 좌상단 오버레이, Top3 Q/A, 실시간 갱신

> 오버레이는 길이가 긴 답변에 대해 줄바꿈/접기 처리를 포함하며, 최근 결과 유지/표시 시간이 함께 노출됩니다.

---
