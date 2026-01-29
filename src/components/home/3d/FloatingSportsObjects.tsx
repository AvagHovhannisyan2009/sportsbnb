import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingObjectProps {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  rotationSpeed: number;
  type: 'basketball' | 'football' | 'tennis';
}

function FloatingObject({ position, color, size, speed, rotationSpeed, type }: FloatingObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth floating animation
    meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed + phase) * 0.3;
    meshRef.current.rotation.x += rotationSpeed * 0.01;
    meshRef.current.rotation.y += rotationSpeed * 0.015;
  });

  // Different geometry based on sport type
  if (type === 'football') {
    return (
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.6} 
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
    );
  }

  if (type === 'tennis') {
    return (
      <Sphere ref={meshRef} args={[size * 0.7, 16, 16]} position={position}>
        <meshStandardMaterial 
          color="#c4ff00" 
          roughness={0.8} 
          metalness={0}
          emissive="#c4ff00"
          emissiveIntensity={0.15}
        />
      </Sphere>
    );
  }

  // Basketball (default)
  return (
    <Sphere ref={meshRef} args={[size, 24, 24]} position={position}>
      <meshStandardMaterial 
        color={color} 
        roughness={0.7} 
        metalness={0.1}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </Sphere>
  );
}

export default function FloatingSportsObjects() {
  const objects = useMemo(() => [
    { position: [-4, 2, -2] as [number, number, number], color: '#ff6b35', size: 0.4, speed: 0.8, rotationSpeed: 0.5, type: 'basketball' as const },
    { position: [4.5, 1, -3] as [number, number, number], color: '#ffffff', size: 0.35, speed: 1.0, rotationSpeed: 0.7, type: 'football' as const },
    { position: [-3, -1, -1] as [number, number, number], color: '#c4ff00', size: 0.25, speed: 1.2, rotationSpeed: 0.9, type: 'tennis' as const },
    { position: [3, 2.5, -4] as [number, number, number], color: '#ff6b35', size: 0.3, speed: 0.6, rotationSpeed: 0.4, type: 'basketball' as const },
    { position: [-5, 0, -2.5] as [number, number, number], color: '#ffffff', size: 0.28, speed: 0.9, rotationSpeed: 0.6, type: 'football' as const },
    { position: [5, -0.5, -1.5] as [number, number, number], color: '#c4ff00', size: 0.2, speed: 1.1, rotationSpeed: 0.8, type: 'tennis' as const },
  ], []);

  return (
    <group>
      {objects.map((obj, i) => (
        <FloatingObject key={i} {...obj} />
      ))}
    </group>
  );
}
