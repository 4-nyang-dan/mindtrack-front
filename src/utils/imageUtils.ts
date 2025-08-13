// SSIM 계산 유틸 함수
/**
 * 이미지 base64 → grayscale luminance matrix 변환 (256x256 고정 리사이즈)
 * canvas를 사용해서 픽셀 추출
 */
export async function base64ToLuminanceMatrix(base64: string): Promise<number[][]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      const matrix: number[][] = [];
      for (let y = 0; y < size; y++) {
        const row: number[] = [];
        for (let x = 0; x < size; x++) {
          // RGBA → grayscale (luminance): 0.299*R + 0.587*G + 0.114*B
          const i = (y * size + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          row.push(lum);
        }
        matrix.push(row);
      }
      resolve(matrix);
    };
  });
}

/**
 * 평균 계산
 */
function mean(matrix: number[][]): number {
  let sum = 0;
  const h = matrix.length;
  const w = matrix[0].length;
  for (const row of matrix) {
    for (const val of row) {
      sum += val;
    }
  }
  return sum / (h * w);
}

/**
 * 분산 계산
 */
function variance(matrix: number[][], mu: number): number {
  let sum = 0;
  const h = matrix.length;
  const w = matrix[0].length;
  for (const row of matrix) {
    for (const val of row) {
      sum += (val - mu) ** 2;
    }
  }
  return sum / (h * w);
}

/**
 * 공분산 계산
 */
function covariance(m1: number[][], m2: number[][], mu1: number, mu2: number): number {
  let sum = 0;
  const h = m1.length;
  const w = m1[0].length;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      sum += (m1[y][x] - mu1) * (m2[y][x] - mu2);
    }
  }
  return sum / (h * w);
}

/**
 * SSIM 계산
 * 백엔드 코드에서 상수 그대로 사용 (C1, C2)
 */
export async function computeSSIM(base64Img1: string, base64Img2: string): Promise<number> {
  const C1 = 6.5025;
  const C2 = 58.5225;

  const mtx1 = await base64ToLuminanceMatrix(base64Img1);
  const mtx2 = await base64ToLuminanceMatrix(base64Img2);

  const mu1 = mean(mtx1);
  const mu2 = mean(mtx2);

  const sigma1Sq = variance(mtx1, mu1);
  const sigma2Sq = variance(mtx2, mu2);

  const sigma12 = covariance(mtx1, mtx2, mu1, mu2);

  const numerator = (2 * mu1 * mu2 + C1) * (2 * sigma12 + C2);
  const denominator = (mu1 * mu1 + mu2 * mu2 + C1) * (sigma1Sq + sigma2Sq + C2);

  return numerator / denominator;
}