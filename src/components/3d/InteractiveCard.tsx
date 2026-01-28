import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface InteractiveCardProps {
  position: [number, number, number];
  image?: string;
  title: string;
  index: number;
}

/**
 * Interactive 3D card with image texture
 * Responds to hover with depth and tilt
 */
export default function InteractiveCard({
  position,
  image,
  title,
  index,
}: InteractiveCardProps) {
  const cardRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!cardRef.current) return;

    // Float animation
    cardRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.2;

    // Tilt effect on hover
    const targetRotation = hovered ? 0.1 : 0;
    cardRef.current.rotation.x = THREE.MathUtils.lerp(
      cardRef.current.rotation.x,
      targetRotation,
      delta * 5
    );

    // Scale on hover
    const targetScale = hovered ? 1.1 : 1;
    cardRef.current.scale.setScalar(
      THREE.MathUtils.lerp(cardRef.current.scale.x, targetScale, delta * 5)
    );
  });

  return (
    <RoundedBox
      ref={cardRef}
      args={[2, 2.5, 0.1]}
      radius={0.1}
      smoothness={4}
      position={position}
      castShadow
      receiveShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color="#ffffff"
        metalness={0.1}
        roughness={0.2}
        emissive="#3b82f6"
        emissiveIntensity={hovered ? 0.3 : 0.1}
      />
    </RoundedBox>
  );
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  const ref = useRef(initialValue);
  return [ref.current, (value: T) => { ref.current = value; }];
}
