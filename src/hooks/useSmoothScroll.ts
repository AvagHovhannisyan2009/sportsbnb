import { useEffect, useState, useCallback } from 'react';
import Lenis from '@studio-freight/lenis';

/**
 * Smooth scroll hook using Lenis
 * Provides buttery-smooth scrolling experience (Apple-quality)
 */
export function useSmoothScroll() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    setLenis(lenisInstance);

    function onScroll(e: any) {
      const progress = e.progress || 0;
      setScrollProgress(progress);
    }

    lenisInstance.on('scroll', onScroll);

    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement) => {
      if (lenis) {
        lenis.scrollTo(target);
      }
    },
    [lenis]
  );

  return { scrollProgress, scrollTo, lenis };
}
