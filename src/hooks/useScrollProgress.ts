import { useState, useEffect, useRef } from 'react';

interface ScrollProgress {
  progress: number;
  isInView: boolean;
}

interface UseScrollProgressOptions {
  threshold?: number;
  offset?: number;
}

export function useScrollProgress(options: UseScrollProgressOptions = {}): [React.RefObject<HTMLDivElement>, ScrollProgress] {
  const { threshold = 0.1, offset = 100 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ScrollProgress>({ progress: 0, isInView: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setState((prev) => ({ ...prev, isInView: entry.isIntersecting }));
        });
      },
      { threshold, rootMargin: `${offset}px` }
    );

    const handleScroll = () => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Calculate progress from 0 (just entering view) to 1 (fully passed)
      const progress = Math.max(0, Math.min(1, 
        (windowHeight - elementTop) / (windowHeight + elementHeight)
      ));
      
      setState((prev) => ({ ...prev, progress }));
    };

    observer.observe(element);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, offset]);

  return [ref, state];
}
