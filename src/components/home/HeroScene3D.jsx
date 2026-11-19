/* eslint-disable react/no-unknown-property -- las props de react-three-fiber
   (position, intensity, object, ...) no son atributos del DOM. */
import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { DRACO_PATH, FACE_CAMERA, GL_PROPS, MODELS, useCleanModel } from './scene3d';
import { StudioLights } from './StudioLights';

/*
 * Escena del hero: el teléfono RH al centro y tres monedas orbitando a su
 * alrededor en 3D (pasan por delante y por detrás del teléfono).
 */

const ORBIT = {
  rx: 1.3, // radio horizontal
  rz: 0.85, // radio en profundidad (mayor que el grosor del teléfono)
  tiltX: -0.32, // inclina la órbita: atrás arriba, adelante abajo
  tiltZ: 0.22,
  period: 14, // segundos por vuelta
};

const COINS = [
  { phase: 0, scale: 0.3, spin: 1.1, bob: 0.06 },
  { phase: (Math.PI * 2) / 3, scale: 0.34, spin: -0.9, bob: 0.08 },
  { phase: (Math.PI * 4) / 3, scale: 0.26, spin: 1.3, bob: 0.05 },
];

function Phone() {
  const { model } = useCleanModel(MODELS.phone);
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = Math.sin(t * 0.9) * 0.05;
    ref.current.rotation.y = -0.32 + Math.sin(t * 0.45) * 0.06;
  });
  return (
    <group ref={ref} rotation={[0.04, -0.32, 0.06]}>
      <primitive object={model} rotation={FACE_CAMERA} />
    </group>
  );
}

function Coin({ phase, scale, spin, bob }) {
  const { model } = useCleanModel(MODELS.coin);
  const orbit = useRef();
  const body = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = phase + (t / ORBIT.period) * Math.PI * 2;
    orbit.current.position.set(Math.cos(a) * ORBIT.rx, Math.sin(t * 1.3 + phase) * bob, Math.sin(a) * ORBIT.rz);
    // giro propio: casi siempre de cara, con un vaivén que muestra el canto
    body.current.rotation.y = Math.sin(t * spin + phase) * 0.9;
    body.current.rotation.z = Math.sin(t * 0.7 + phase) * 0.25;
  });
  return (
    <group ref={orbit}>
      <group ref={body} scale={scale}>
        <primitive object={model} rotation={FACE_CAMERA} />
      </group>
    </group>
  );
}

function Rig({ onReady }) {
  // Si llegamos aquí, los dos modelos ya cargaron (useGLTF suspende antes)
  useGLTF(MODELS.phone, DRACO_PATH);
  useGLTF(MODELS.coin, DRACO_PATH);
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <group position={[0, -0.05, 0]}>
      <Phone />
      {/* solo la órbita va inclinada; el teléfono se queda derecho */}
      <group rotation={[ORBIT.tiltX, 0, ORBIT.tiltZ]}>
        {COINS.map((c, i) => (
          <Coin key={i} {...c} />
        ))}
      </group>
    </group>
  );
}

/**
 * Acerca la cámara lo más posible sin cortar la órbita: el fov de three es
 * vertical, así que en lienzos angostos (móvil) hay que alejarse más.
 */
const FIT = { halfH: 1.25, halfW: 1.8, minZ: 4.6 };
function FitCamera() {
  const camera = useThree((s) => s.camera);
  const { width, height } = useThree((s) => s.size);
  useEffect(() => {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const aspect = width / height;
    camera.position.z = Math.max(FIT.minZ, FIT.halfH / tan, FIT.halfW / (tan * aspect));
    camera.updateProjectionMatrix();
  }, [camera, width, height]);
  return null;
}

export default function HeroScene3D({ active = true, onReady }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6.2], fov: 32 }}
      gl={GL_PROPS}
    >
      <FitCamera />
      <StudioLights />
      <Suspense fallback={null}>
        <Rig onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODELS.phone, DRACO_PATH);
useGLTF.preload(MODELS.coin, DRACO_PATH);
