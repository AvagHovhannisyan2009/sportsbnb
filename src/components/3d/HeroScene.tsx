import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  Sparkles,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';

/**
 * Premium 3D Hero Scene
 * Features: Cinematic lighting, dynamic sports equipment, particle systems
 */
export default function HeroScene({ scrollProgress = 0 }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Animated rotation and parallax based on scroll
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth camera movement based on scroll
    easing.damp3(
      state.camera.position,
      [
        Math.sin(scrollProgress * Math.PI * 0.5) * 2,
        1 + scrollProgress * 2,
        8 - scrollProgress * 3,
      ],
      0.3,
      delta
    );

    state.camera.lookAt(0, 0, 0);

    // Rotate the entire scene
    groupRef.current.rotation.y += delta * 0.1;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

    // Animate center sphere
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.5;
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <>
      {/* Cinematic Environment Lighting */}
      <Environment preset="city" />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[-10, 10, -5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        color="#3b82f6"
      />

      <group ref={groupRef}>
        {/* Center Premium Glass Sphere */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh ref={sphereRef} castShadow receiveShadow>
            <sphereGeometry args={[1.2, 64, 64]} />
            <MeshTransmissionMaterial
              backside
              backsideThickness={5}
              thickness={2}
              chromaticAberration={0.5}
              anisotropy={1}
              distortion={0.3}
              distortionScale={0.5}
              temporalDistortion={0.1}
              iridescence={1}
              iridescenceIOR={1}
              iridescenceThicknessRange={[0, 1400]}
            />
          </mesh>
        </Float>

        {/* Orbiting Sport Elements */}
        <SportsBalls />

        {/* Premium Sparkle Particles */}
        <Sparkles
          count={100}
          scale={10}
          size={3}
          speed={0.4}
          opacity={0.6}
          color="#3b82f6"
        />

        {/* Geometric Rings */}
        <GeometricRings />
      </group>

      {/* Background Gradient Mesh */}
      <mesh position={[0, 0, -5]} scale={[viewport.width * 2, viewport.height * 2, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          color="#0a0a0f"
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}

function SportsBalls() {
  const positions = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 3 + Math.random() * 1;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle * 0.5) * 2,
        z: Math.sin(angle) * radius,
        scale: 0.3 + Math.random() * 0.2,
        color: ['#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)],
      };
    });
  }, []);

  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={1}>
          <mesh position={[pos.x, pos.y, pos.z]} scale={pos.scale} castShadow>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={pos.color}
              metalness={0.8}
              roughness={0.2}
              emissive={pos.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function GeometricRings() {
  return (
    <>
      {[2, 3, 4].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.2 - i * 0.05}
            emissive="#3b82f6"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}
