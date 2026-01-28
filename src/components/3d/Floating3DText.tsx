import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, useMatcapTexture } from '@react-three/drei';
import * as THREE from 'three';

interface Floating3DTextProps {
  text: string;
  position?: [number, number, number];
  size?: number;
  color?: string;
}

/**
 * Premium 3D floating text with matcap material
 * Perfect for hero headlines and section titles
 */
export default function Floating3DText({
  text,
  position = [0, 0, 0],
  size = 1,
  color = '#3b82f6',
}: Floating3DTextProps) {
  const textRef = useRef<THREE.Mesh>(null);
  const [matcapTexture] = useMatcapTexture('3E2335_D36A1B_8E4A2E_2842A5', 256);

  useFrame((state) => {
    if (!textRef.current) return;
    
    // Gentle floating animation
    textRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
    // Subtle rotation toward camera
    textRef.current.lookAt(state.camera.position);
  });

  return (
    <Center position={position}>
      <Text3D
        ref={textRef}
        font="/fonts/Inter_Bold.json" // You'll need to add this font
        size={size}
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        {text}
        <meshMatcapMaterial matcap={matcapTexture} color={color} />
      </Text3D>
    </Center>
  );
}
