import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Premium animation presets matching Apple/Stripe/Tesla quality
 */
export const animations = {
  // Fade in from bottom with scale
  fadeInUp: {
    initial: { opacity: 0, y: 60, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },

  // Fade in with blur
  fadeInBlur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] },
  },

  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },

  // Slide from left
  slideFromLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },

  // Slide from right
  slideFromRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },

  // Premium card hover
  cardHover: {
    scale: 1.02,
    y: -8,
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)',
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },

  // Magnetic button
  magneticHover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
  },
};

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(triggerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!triggerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(triggerRef.current, {
        scrollTrigger: {
          trigger: triggerRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 100,
        duration: 1,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, [triggerRef]);
}

/**
 * Hook for parallax effect
 */
export function useParallax(ref: React.RefObject<HTMLElement>, speed: number = 0.5) {
  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        y: () => window.innerHeight * speed,
        ease: 'none',
      });
    });

    return () => ctx.revert();
  }, [ref, speed]);
}

/**
 * Hook for stagger animations
 */
export function useStaggerAnimation(
  containerRef: React.RefObject<HTMLElement>,
  childSelector: string,
  delay: number = 0.1
) {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current!.querySelectorAll(childSelector), {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 60,
        stagger: delay,
        duration: 0.8,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, [containerRef, childSelector, delay]);
}

/**
 * Premium easing functions
 */
export const easings = {
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeOutQuint: [0.22, 1, 0.36, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  spring: [0.34, 1.56, 0.64, 1],
};
