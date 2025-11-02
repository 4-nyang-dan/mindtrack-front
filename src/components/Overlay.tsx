import React, { useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Overlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ✅ ESC로 종료
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        ipcRenderer.send("HIDE_OVERLAY");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // ✅ 마우스 드래그 이벤트
    const handleMouseDown = (e: MouseEvent) => {
      setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!startPos) return;
      const rect: Box = {
        x: Math.min(startPos.x, e.clientX),
        y: Math.min(startPos.y, e.clientY),
        width: Math.abs(e.clientX - startPos.x),
        height: Math.abs(e.clientY - startPos.y),
      };
      setCurrentBox(rect);
    };

    const handleMouseUp = () => {
      if (!currentBox) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const normalized = {
        xRatio: currentBox.x / screenW,
        yRatio: currentBox.y / screenH,
        widthRatio: currentBox.width / screenW,
        heightRatio: currentBox.height / screenH,
      };

      console.log("📐 비율 좌표:", normalized);
      ipcRenderer.send("BOX_SELECTED", normalized);
      ipcRenderer.send("HIDE_OVERLAY");
    };

    // ✅ 캔버스 렌더링
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (currentBox) {
        ctx.clearRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      }

      requestAnimationFrame(render);
    };
    render();

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [startPos, currentBox]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        cursor: "crosshair",
        background: "rgba(0,0,0,0.2)",
      }}
    />
  );
};

export default Overlay;
