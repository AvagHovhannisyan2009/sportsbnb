import { Canvas } from '@react-three/fiber';
import { Suspense, ReactNode } from 'react';
import { PerformanceMonitor } from '@react-three/drei';

interface Scene3DProps {
  children: ReactNode;
  className?: string;
  onPerformanceChange?: (fps: number) => void;
}

/**
 * Main 3D Canvas wrapper with performance monitoring
 * Handles WebGL context, camera setup, and performance optimization
 */
export default function Scene3D({ children, className = '', onPerformanceChange }: Scene3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]} // Pixel ratio for high-DPI displays
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        shadows
        className="!absolute inset-0"
      >
        <Suspense fallback={null}>
          {onPerformanceChange && (
            <PerformanceMonitor
              onIncline={() => onPerformanceChange(60)}
              onDecline={() => onPerformanceChange(30)}
            />
          )}
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
