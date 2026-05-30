'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Icosahedron, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Mouse-following camera ─── */
function CameraRig() {
  const { camera } = useThree();

  useFrame(({ pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.5, 0.015);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.8, 0.015);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Main geometric centerpiece ─── */
function CoreShape() {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.08;
      meshRef.current.rotation.y = t * 0.12;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = t * 0.08;
      wireRef.current.rotation.y = t * 0.12;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={1.5}>
      <group>
        {/* Solid core with distortion — holographic glass effect */}
        <Icosahedron ref={meshRef} args={[2, 4]}>
          <MeshDistortMaterial
            color="#7c3aed"
            distort={0.35}
            speed={1.5}
            roughness={0.1}
            metalness={0.95}
            transparent
            opacity={0.12}
          />
        </Icosahedron>

        {/* Wireframe shell — visible structure */}
        <Icosahedron ref={wireRef} args={[2.05, 1]}>
          <meshBasicMaterial
            color="#c084fc"
            wireframe
            transparent
            opacity={0.3}
          />
        </Icosahedron>
      </group>
    </Float>
  );
}

/* ─── Floating star-field particles ─── */
function Particles({ count = 200 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const r = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#a78bfa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Orbiting accent spheres ─── */
function OrbitingSphere({ radius, speed, color, size = 0.06 }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.y = Math.sin(t * 0.6) * (radius * 0.3);
      ref.current.position.z = Math.sin(t) * radius;
    }
  });

  return (
    <Sphere ref={ref} args={[size, 16, 16]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </Sphere>
  );
}

/* ─── Orbital ring (dot ring around the centerpiece) ─── */
function OrbitalRing({ radius, count = 60, color, speed = 0.1 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, [count, radius]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * speed;
      ref.current.rotation.x = 0.3;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={color}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN 3D SCENE — used as Hero background
   Features: Distorted icosahedron, particles, orbital rings,
   orbiting spheres, mouse-reactive camera
   ═══════════════════════════════════════════════════════════════ */
export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-5, -3, 3]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, -5, -5]} intensity={0.4} color="#ec4899" />

      {/* Camera follows mouse */}
      <CameraRig />

      {/* Main elements */}
      <CoreShape />
      <Particles count={160} />

      {/* Orbital rings */}
      <OrbitalRing radius={3.5} count={80} color="#8b5cf6" speed={0.08} />
      <OrbitalRing radius={4.5} count={60} color="#06b6d4" speed={-0.05} />

      {/* Orbiting accent spheres */}
      <OrbitingSphere radius={3} speed={0.25} color="#06b6d4" size={0.07} />
      <OrbitingSphere radius={3.8} speed={0.18} color="#ec4899" size={0.05} />
      <OrbitingSphere radius={4.2} speed={0.12} color="#10b981" size={0.04} />
    </Canvas>
  );
}
