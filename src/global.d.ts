// global.d.ts
export {};

declare global {
  interface Window {
    overlaySelect: {
      show: () => void;
      hide: () => void;
      onBoxSelected: (handler: (box: BoxRatio) => void) => () => void;
    };
  }

  interface BoxRatio {
    xRatio: number;
    yRatio: number;
    widthRatio: number;
    heightRatio: number;
  }
}
