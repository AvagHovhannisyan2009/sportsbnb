import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Dynamic particle field that responds to scroll
 * Creates depth and movement in the scene
 */
export default function ParticleField({ count = 1000, scrollProgress = 0 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Distribute particles in a volume
      positions[i * 3] = (Math.random() - 0.5) * 40; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // z
    }
    
    return positions;
  }, [count]);

  const particlesColor = useMemo(() => {
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Gradient from blue to purple
      const t = i / count;
      colors[i * 3] = THREE.MathUtils.lerp(0.23, 0.55, t); // r
      colors[i * 3 + 1] = THREE.MathUtils.lerp(0.51, 0.36, t); // g
      colors[i * 3 + 2] = THREE.MathUtils.lerp(0.96, 0.95, t); // b
    }
    
    return colors;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create wave motion
      const y = positions[i3 + 1];
      positions[i3] += Math.sin(time + y * 0.1) * 0.01;
      positions[i3 + 2] += Math.cos(time + y * 0.1) * 0.01;
      
      // Move particles based on scroll
      positions[i3 + 2] -= scrollProgress * 0.5;
      
      // Wrap particles
      if (positions[i3 + 2] < -20) {
        positions[i3 + 2] = 20;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particlesColor}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
