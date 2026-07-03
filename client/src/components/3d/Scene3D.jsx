import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, speed = 1, distort = 0.4 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      ref.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere ref={ref} args={[1, 32, 32]} position={position} scale={0.6}>
        <MeshDistortMaterial color={color} distort={distort} speed={2} roughness={0.2} metalness={0.8} />
      </Sphere>
    </Float>
  );
}

function Ring({ position, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.5;
  });
  return (
    <Torus ref={ref} args={[1.5, 0.05, 16, 100]} position={position}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </Torus>
  );
}

function Particles({ count = 500 }) {
  const points = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#818cf8" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Scene3D({ interactive = true }) {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#ec4899" />
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Particles count={400} />
        {interactive && (
          <>
            <FloatingShape position={[-3, 1, -2]} color="#6366f1" speed={0.8} />
            <FloatingShape position={[3, -1, -1]} color="#8b5cf6" speed={1.2} distort={0.6} />
            <FloatingShape position={[0, 2, -3]} color="#ec4899" speed={0.6} distort={0.3} />
            <Ring position={[0, 0, -4]} color="#6366f1" />
          </>
        )}
      </Canvas>
    </div>
  );
}
