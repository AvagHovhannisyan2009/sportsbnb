import { useRef, useState, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';

interface FloatingCardProps {
  children: ReactNode;
  position: [number, number, number];
  index: number;
  scrollProgress: number;
}

/**
 * Floating UI Card with depth and hover interactions
 * Responds to scroll and mouse position for premium feel
 */
export default function FloatingCard({
  children,
  position,
  index,
  scrollProgress,
}: FloatingCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Float animation
    const baseY = position[1];
    meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime + index) * 0.3;

    // Hover depth effect
    const targetZ = hovered ? position[2] + 1 : position[2];
    easing.damp(meshRef.current.position, 'z', targetZ, 0.3, delta);

    // Subtle rotation based on mouse
    const targetRotationY = (state.mouse.x * Math.PI) / 10;
    const targetRotationX = (state.mouse.y * Math.PI) / 10;
    easing.damp(meshRef.current.rotation, 'y', targetRotationY, 0.3, delta);
    easing.damp(meshRef.current.rotation, 'x', targetRotationX, 0.3, delta);

    // Scroll-based reveal
    const revealProgress = Math.min(1, Math.max(0, scrollProgress * 3 - index * 0.3));
    easing.damp(meshRef.current.scale, 'x', revealProgress, 0.5, delta);
    easing.damp(meshRef.current.scale, 'y', revealProgress, 0.5, delta);
    easing.damp(meshRef.current.scale, 'z', revealProgress, 0.5, delta);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Html
        transform
        occlude
        distanceFactor={8}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <div
          className={`
            backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6
            shadow-2xl transition-all duration-500
            ${hovered ? 'shadow-primary/50' : 'shadow-black/20'}
          `}
        >
          {children}
        </div>
      </Html>
    </mesh>
  );
}
