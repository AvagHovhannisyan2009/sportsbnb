import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

/**
 * Animated gradient background with shader material
 * Creates dynamic, premium background effect
 */
export default function GradientBackground() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // @ts-ignore
    const material = meshRef.current.material;
    if (material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    
    void main() {
      // Animated gradient
      vec2 uv = vUv;
      
      float gradient1 = sin(uv.y * 3.14159 + uTime * 0.5) * 0.5 + 0.5;
      float gradient2 = cos(uv.x * 3.14159 + uTime * 0.3) * 0.5 + 0.5;
      
      vec3 color1 = vec3(0.05, 0.05, 0.15); // Dark blue
      vec3 color2 = vec3(0.23, 0.51, 0.96); // Primary blue
      vec3 color3 = vec3(0.55, 0.36, 0.95); // Purple
      
      vec3 finalColor = mix(color1, color2, gradient1);
      finalColor = mix(finalColor, color3, gradient2 * 0.3);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, 0, -10]} scale={[50, 50, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
        }}
      />
    </mesh>
  );
}
