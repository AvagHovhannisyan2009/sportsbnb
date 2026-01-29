import { Suspense, lazy, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';

const FloatingSportsObjects = lazy(() => import('./FloatingSportsObjects'));
const GeometricBackground = lazy(() => import('./GeometricBackground'));

function SceneContent() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#f97316" />
      <pointLight position={[5, 5, 5]} intensity={0.2} color="#60a5fa" />
      
      {/* 3D Elements */}
      <Suspense fallback={null}>
        <GeometricBackground />
        <FloatingSportsObjects />
      </Suspense>
      
      <Preload all />
    </>
  );
}

interface Hero3DSceneProps {
  className?: string;
}

function Hero3DScene({ className }: Hero3DSceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

export default memo(Hero3DScene);
