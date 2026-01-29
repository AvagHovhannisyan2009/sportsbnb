import { memo, ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayeredHeroProps {
  backgroundImage: string;
  backgroundAlt: string;
  children: ReactNode;
  className?: string;
}

function LayeredHero({ backgroundImage, backgroundAlt, children, className = '' }: LayeredHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const mousePosition = useMouseParallax({ intensity: 0.01 });

  // Parallax transforms
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.8]);

  const shouldAnimate = !prefersReducedMotion && !isMobile;

  return (
    <section ref={containerRef} className={`relative min-h-[90vh] flex items-center overflow-hidden ${className}`}>
      {/* Background layer - deepest */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={shouldAnimate ? { 
          y: bgY,
          scale: bgScale,
          x: mousePosition.x * 0.5,
        } : undefined}
      >
        <img
          src={backgroundImage}
          alt={backgroundAlt}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </motion.div>

      {/* Gradient overlay layer */}
      <motion.div 
        className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/50 to-black/80"
        style={shouldAnimate ? { opacity: overlayOpacity } : { opacity: 0.65 }}
      />

      {/* Subtle gradient accent */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* Content layer - foreground */}
      <motion.div 
        className="relative z-10 w-full"
        style={shouldAnimate ? { 
          y: contentY,
          x: mousePosition.x * -0.3,
        } : undefined}
      >
        {children}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div 
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          animate={shouldAnimate ? { y: [0, 5, 0] } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div 
            className="w-1 h-2 bg-white/60 rounded-full"
            animate={shouldAnimate ? { opacity: [0.6, 1, 0.6] } : undefined}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default memo(LayeredHero);
