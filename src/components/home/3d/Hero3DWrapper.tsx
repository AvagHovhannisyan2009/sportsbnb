import { lazy, Suspense, useState, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero3DScene = lazy(() => import('./Hero3DScene'));

interface Hero3DWrapperProps {
  className?: string;
}

export default function Hero3DWrapper({ className }: Hero3DWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(!!gl);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Don't render 3D on mobile, reduced motion preference, or if WebGL isn't available
  if (!isClient || isMobile || prefersReducedMotion || !hasWebGL) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Hero3DScene className={className} />
    </Suspense>
  );
}
