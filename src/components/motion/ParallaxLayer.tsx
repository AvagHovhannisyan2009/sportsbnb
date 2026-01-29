import { ReactNode, memo, CSSProperties } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  mouseIntensity?: number;
  className?: string;
  style?: CSSProperties;
}

function ParallaxLayer({
  children,
  speed = 0.5,
  mouseIntensity = 0.02,
  className = '',
  style,
}: ParallaxLayerProps) {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const mousePosition = useMouseParallax({ intensity: mouseIntensity });
  
  // Transform scroll position to parallax offset
  const y = useTransform(scrollY, [0, 1000], [0, -100 * speed]);

  if (prefersReducedMotion || isMobile) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{
        ...style,
        y,
        x: mousePosition.x,
        translateY: mousePosition.y,
      }}
    >
      {children}
    </motion.div>
  );
}

export default memo(ParallaxLayer);
