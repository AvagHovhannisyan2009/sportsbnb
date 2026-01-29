import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleProps {
  count: number;
}

function Particles({ count }: ParticleProps) {
  const meshRef = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Spread particles in a wide area
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      
      // Subtle color variation (primary color tones)
      const intensity = 0.3 + Math.random() * 0.4;
      colors[i * 3] = 0.95 * intensity; // R
      colors[i * 3 + 1] = 0.45 * intensity; // G
      colors[i * 3 + 2] = 0.2 * intensity; // B
    }
    
    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingGeometry() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  const geometries = useMemo(() => [
    { position: [-6, 3, -8] as [number, number, number], rotation: [0.5, 0.3, 0] as [number, number, number], scale: 0.8 },
    { position: [6, -2, -6] as [number, number, number], rotation: [0.2, 0.8, 0.1] as [number, number, number], scale: 0.6 },
    { position: [-4, -3, -7] as [number, number, number], rotation: [0.7, 0.1, 0.4] as [number, number, number], scale: 0.5 },
    { position: [5, 3, -9] as [number, number, number], rotation: [0.3, 0.6, 0.2] as [number, number, number], scale: 0.7 },
  ], []);

  return (
    <group ref={groupRef}>
      {geometries.map((geo, i) => (
        <mesh key={i} position={geo.position} rotation={geo.rotation} scale={geo.scale}>
          {i % 2 === 0 ? (
            <octahedronGeometry args={[1, 0]} />
          ) : (
            <icosahedronGeometry args={[1, 0]} />
          )}
          <meshStandardMaterial
            color="#f97316"
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

export default function GeometricBackground() {
  return (
    <group>
      <Particles count={150} />
      <FloatingGeometry />
    </group>
  );
}
