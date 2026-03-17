import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

/**
 * Subtle camera breathing animation — gives the scene an organic, cinematic feel.
 * The camera gently sways in a lissajous pattern, barely noticeable but adds life.
 */
export function CameraBreathing() {
  const { camera } = useThree();
  const time = useRef(0);
  const baseZ = useRef(camera.position.z);

  useFrame((_, delta) => {
    time.current += delta;
    const t = time.current;

    // Lissajous breathing — very subtle
    camera.position.x = Math.sin(t * 0.15) * 0.08;
    camera.position.y = Math.sin(t * 0.12 + 1.0) * 0.05;
    camera.position.z = baseZ.current + Math.sin(t * 0.1) * 0.12;

    // Slight look-at drift to keep centered
    camera.lookAt(0.6, 0.2, 0);
  });

  return null;
}
