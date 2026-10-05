/* eslint-disable react/no-unknown-property -- react-three-fiber's JSX intrinsics
   (mesh, args, intensity, castShadow, ...) aren't DOM props; this rule only
   knows HTML attributes. */
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Abstract faceted "reward gem" — an icosahedron pushed through a clear
// glass/transmission material, slowly tumbling and leaning gently toward the
// cursor. Its facets stay neutral and pick up color entirely from the
// multi-hue rim lights in <Scene>, so it reads as an iridescent prism rather
// than a single-color object. Stands in for RewardsHub having no physical
// product to photograph (the gem reads as "reward" without being a literal
// coin/medal cliché).
function Gem() {
  const group = useRef(null);
  const inner = useRef(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    target.current.x = state.pointer.y * 0.25;
    target.current.y = state.pointer.x * 0.35;

    if (group.current) {
      group.current.rotation.x += (target.current.x - group.current.rotation.x) * 0.04;
      group.current.rotation.y += delta * 0.18 + (target.current.y - group.current.rotation.y) * 0.03;
    }
    if (inner.current) {
      inner.current.rotation.x -= delta * 0.12;
      inner.current.rotation.z += delta * 0.07;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={group}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.5, 0]} />
          <MeshTransmissionMaterial
            color="#FFFFFF"
            thickness={0.6}
            roughness={0.03}
            transmission={1}
            ior={1.4}
            chromaticAberration={0.35}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.08}
            clearcoat={1}
            attenuationColor="#F5F0FF"
            attenuationDistance={0.6}
            background={new THREE.Color('#FFFFFF')}
          />
        </mesh>
        {/* smaller inner facet core — a warm brand-amber ember at the center,
            catching extra highlights so the gem reads as a cut, lit stone */}
        <mesh ref={inner} scale={0.5}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial
            color="#FFD876"
            metalness={0.85}
            roughness={0.1}
            emissive="#EBA626"
            emissiveIntensity={0.55}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Multi-hue rim lights — pink, violet and sky-blue alongside a warm amber
// key light — are what give the gem's clear facets their iridescent color,
// matching the page's vivid gradient-mesh palette instead of a single tint.
function Scene() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 5, 3]} intensity={1.6} color="#FFFFFF" castShadow />
      <pointLight position={[-4, -1, 2]} intensity={2.2} color="#FF5FA2" />
      <pointLight position={[0, 3, -3]} intensity={1.8} color="#8B5CF6" />
      <pointLight position={[3, -3, -2]} intensity={1.8} color="#38BDF8" />
      <pointLight position={[2, 2, 3]} intensity={1.4} color="#EBA626" />
      <Gem />
      <Environment preset="studio" />
    </>
  );
}

export function RewardGem3D({ className = '' }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color('#000000'), 0)}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
