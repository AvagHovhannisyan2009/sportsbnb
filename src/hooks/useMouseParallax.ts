import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsMobile } from './use-mobile';
import { useReducedMotion } from './useReducedMotion';

interface ParallaxPosition {
  x: number;
  y: number;
}

interface UseMouseParallaxOptions {
  intensity?: number;
  smooth?: number;
}

export function useMouseParallax(options: UseMouseParallaxOptions = {}): ParallaxPosition {
  const { intensity = 0.02, smooth = 0.1 } = options;
  const [position, setPosition] = useState<ParallaxPosition>({ x: 0, y: 0 });
  const targetRef = useRef<ParallaxPosition>({ x: 0, y: 0 });
  const rafRef = useRef<number>();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    targetRef.current = {
      x: (e.clientX - centerX) * intensity,
      y: (e.clientY - centerY) * intensity,
    };
  }, [intensity]);

  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    const animate = () => {
      setPosition((prev) => ({
        x: prev.x + (targetRef.current.x - prev.x) * smooth,
        y: prev.y + (targetRef.current.y - prev.y) * smooth,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, smooth, isMobile, prefersReducedMotion]);

  return isMobile || prefersReducedMotion ? { x: 0, y: 0 } : position;
}
