import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ScrollRigProps {
  scrollProgress: number;
}

/**
 * Camera rig that responds to scroll for spatial navigation
 * Creates the feeling of moving through 3D space
 */
export default function ScrollRig({ scrollProgress }: ScrollRigProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    // Calculate camera path through space based on scroll
    const progress = scrollProgress;
    
    // Camera position path (bezier-like curve through space)
    targetPosition.current.set(
      Math.sin(progress * Math.PI) * 3,
      progress * 5 - 2,
      8 - progress * 10
    );

    // Look-at target (what camera focuses on)
    targetLookAt.current.set(
      Math.sin(progress * Math.PI * 2) * 2,
      progress * 3,
      -progress * 5
    );
  }, [scrollProgress]);

  useFrame((_, delta) => {
    // Smooth camera movement (cinematic easing)
    camera.position.lerp(targetPosition.current, delta * 2);
    
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.add(camera.position);
    currentLookAt.lerp(targetLookAt.current, delta * 2);
    
    camera.lookAt(currentLookAt);
  });

  return null;
}
