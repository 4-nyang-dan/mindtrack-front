// src/api/sampling.ts
import { dataURLtoBlob } from "../utils/dataUrl";

// src/api/sampling.ts
export async function uploadScreenshotToBackend(base64Image: string, userId: string) {
  const blob = dataURLtoBlob(base64Image);
  const arrayBuffer = await blob.arrayBuffer();

  // window.api.upload 사용
  const result = await window.api.upload("/upload-screenshot", {
    name: `screenshot-${Date.now()}.png`,
    type: blob.type,
    buffer: arrayBuffer,
  }, { userId }); // fields로 userId 전송

  if (result.status !== 200) {
    throw new Error(`Upload failed: ${result.status} ${result.body}`);
  }

  return JSON.parse(result.body);
}
