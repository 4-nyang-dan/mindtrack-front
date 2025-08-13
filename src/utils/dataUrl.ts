// src/utils/dataUrl.ts
//Spring(MultipartFile) 형식으로 보내기 위해
//Base64 문자열을 Blob -> FormData 순서로 변환해서 전송

export function dataURLtoBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/png";
  const binary = atob(data);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime }); //Blob 객체 생성
}
