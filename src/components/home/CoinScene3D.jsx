/* eslint-disable react/no-unknown-property -- las props de react-three-fiber
   (position, intensity, object, ...) no son atributos del DOM. */
import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { Framed } from './Framed';
import { DRACO_PATH, FACE_CAMERA, GL_PROPS, MODELS, useCleanModel } from './scene3d';
import { StudioLights } from './StudioLights';

/*
 * Moneda RH del CTA final: gira sin parar sobre su eje vertical, mostrando la R
 * de las dos caras y el canto. Con `fast` (hover) acelera y luego vuelve a su ritmo.
 */

const { damp } = THREE.MathUtils;
const BASE_SPEED = (Math.PI * 2) / 3.2; // una vuelta cada 3.2 s
const FAST_SPEED = BASE_SPEED * 3.5;
const TILT = -0.18; // ligera inclinación hacia la cámara para que se vea el canto

function Coin({ fast }) {
  const { model } = useCleanModel(MODELS.coin);
  const spin = useRef();
  const float = useRef();
  const speed = useRef(BASE_SPEED);

  useFrame(({ clock }, dt) => {
    const step = Math.min(dt, 0.05); // evita saltos al volver de otra pestaña
    speed.current = damp(speed.current, fast ? FAST_SPEED : BASE_SPEED, fast ? 4 : 1.6, step);
    spin.current.rotation.y += speed.current * step;
    const t = clock.elapsedTime;
    float.current.position.y = Math.sin(t * 1.2) * 0.06;
    float.current.rotation.z = Math.sin(t * 0.7) * 0.05;
  });

  return (
    <group ref={float}>
      <group rotation={[TILT, 0, 0]}>
        <group ref={spin}>
          <primitive object={model} rotation={FACE_CAMERA} />
        </group>
      </group>
    </group>
  );
}

function Rig({ fast, onReady }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  // Framed mide la moneda de frente (su pose más ancha); el margen deja aire para el giro y el flotado
  return (
    <Framed margin={1.35}>
      <Coin fast={fast} />
    </Framed>
  );
}

export default function CoinScene3D({ fast = false, running = true, onReady }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={running ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 26 }}
      gl={GL_PROPS}
    >
      <StudioLights />
      <Suspense fallback={null}>
        <Rig fast={fast} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODELS.coin, DRACO_PATH);
