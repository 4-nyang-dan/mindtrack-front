import React from "react";
// 부모 컴포넌트에서 상태와 핸들러 받아 렌더링
interface Props {
  capturing: boolean;
  startCapture: () => void;
  stopCapture: () => void;
}

export default function CaptureControls({ capturing, startCapture, stopCapture }: Props) {
  return (
    <div>
      <button onClick={startCapture} disabled={capturing}>
        ▶ 시작
      </button>
      <button onClick={stopCapture} disabled={!capturing}>
        ⏹ 정지
      </button>
    </div>
  );
}
