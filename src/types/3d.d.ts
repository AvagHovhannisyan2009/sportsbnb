// Type declarations for 3D libraries
declare module '@studio-freight/lenis' {
  export interface LenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    direction?: 'vertical' | 'horizontal';
    gestureDirection?: 'vertical' | 'horizontal' | 'both';
    smooth?: boolean;
    smoothTouch?: boolean;
    touchMultiplier?: number;
  }

  export default class Lenis {
    constructor(options?: LenisOptions);
    on(event: string, callback: (e: any) => void): void;
    off(event: string, callback: (e: any) => void): void;
    raf(time: number): void;
    scrollTo(target: string | number | HTMLElement, options?: any): void;
    destroy(): void;
  }
}

declare module 'maath' {
  export const easing: {
    damp: (current: number, target: number, smoothing: number, delta: number) => number;
    damp3: (
      current: { x: number; y: number; z: number } | number[],
      target: { x: number; y: number; z: number } | number[],
      smoothing: number,
      delta: number
    ) => void;
  };
}
