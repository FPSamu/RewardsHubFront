/* eslint-disable react/no-unknown-property -- las props de react-three-fiber
   (position, intensity, object, ...) no son atributos del DOM. */
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { DRACO_PATH, FACE_CAMERA, GL_PROPS, MODELS, useCleanModel } from './scene3d';
import { Framed } from './Framed';
import { StudioLights } from './StudioLights';

/*
 * Escenas 3D de las tarjetas de "Cómo funciona". Cada una reacciona a `active`
 * (hover en desktop; tarjeta al centro de la pantalla en táctil):
 *   gear  → los engranes y la moneda giran
 *   phone → el teléfono se pone de frente, un haz escanea el QR y salen monedas
 *   gift  → el regalo se abre (tapa, monedas y confeti) y se cierra al salir
 */

const { damp, lerp, clamp } = THREE.MathUtils;

/* ---------------------------------------------------------------- 01 · engranes */

const GEAR_TURN_SECONDS = 2.6; // una vuelta del engrane grande con hover

function Gear({ active }) {
  const { model, animations } = useCleanModel(MODELS.gear, { resetPose: false });
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const coin = useMemo(() => model.getObjectByName('RH_Coin'), [model]);
  const rate = useMemo(() => (animations[0]?.duration ?? 10) / GEAR_TURN_SECONDS, [animations]);
  const float = useRef();
  const speed = useRef(0);

  useEffect(() => {
    // Clips de Blender: una vuelta completa de cada engrane (con su relación 16:9)
    animations.forEach((clip) => mixer.clipAction(clip).play());
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    };
  }, [animations, mixer, model]);

  useFrame(({ clock }, dt) => {
    // arranca y frena con inercia
    speed.current = damp(speed.current, active ? 1 : 0, active ? 2.6 : 1.8, dt);
    mixer.update(dt * speed.current * rate);
    if (coin) coin.rotation.y -= dt * speed.current * 4.5;
    float.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.04;
  });

  // La cámara de Blender miraba 8° desde arriba; aquí inclinamos el modelo
  return (
    <group ref={float} rotation={[0.14, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

/* --------------------------------------------------------------- 02 · teléfono */

// Coordenadas locales del GLB del teléfono: pantalla hacia +Y, arriba = -Z
const SCAN = { y: 0.09, top: -0.3, bottom: 0.26, width: 0.62 };
const POP_COINS = [0, 1, 2];

function Phone({ active }) {
  const { model } = useCleanModel(MODELS.phone);
  const { model: coinModel } = useCleanModel(MODELS.coin);
  const coins = useMemo(() => POP_COINS.map(() => coinModel.clone(true)), [coinModel]);
  const pose = useRef();
  const beam = useRef();
  const beamMats = useRef([]);
  const coinRefs = useRef([]);
  const k = useRef(0);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const a = (k.current = damp(k.current, active ? 1 : 0, 4, dt));

    // reposo: tres cuartos y flotando; hover: de frente, un poco arriba
    pose.current.rotation.y = lerp(-0.42 + Math.sin(t * 0.6) * 0.05, 0, a);
    pose.current.rotation.x = lerp(0.06, -0.06, a);
    pose.current.position.y = Math.sin(t * 0.9) * 0.03 * (1 - a) + a * 0.05;

    // haz de escaneo que sube y baja sobre el QR
    beam.current.visible = a > 0.01;
    beam.current.position.z = lerp(SCAN.top, SCAN.bottom, (Math.sin(t * 3) + 1) / 2);
    beamMats.current[0].opacity = a;
    beamMats.current[1].opacity = a * 0.28;

    // monedas que brotan de la pantalla, giran y se desvanecen
    coinRefs.current.forEach((c, i) => {
      const p = (t * 0.55 + i / POP_COINS.length) % 1;
      c.position.set((i - 1) * 0.5 * p, 0.12 + p * 0.55, -0.05 - p * 0.75);
      c.rotation.z = t * 3 + i * 2;
      c.scale.setScalar(Math.sin(Math.PI * p) * 0.2 * a + 1e-4);
    });
  });

  return (
    <group ref={pose}>
      <group rotation={FACE_CAMERA}>
        <primitive object={model} />
        <group ref={beam} position={[0, SCAN.y, 0]} visible={false}>
          <mesh>
            <boxGeometry args={[SCAN.width, 0.008, 0.012]} />
            <meshBasicMaterial ref={(m) => (beamMats.current[0] = m)} color="#FFB733" transparent toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[SCAN.width + 0.04, 0.09]} />
            <meshBasicMaterial
              ref={(m) => (beamMats.current[1] = m)}
              color="#FFB733"
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
        {coins.map((c, i) => (
          <primitive key={i} object={c} ref={(o) => (coinRefs.current[i] = o)} scale={1e-4} />
        ))}
      </group>
    </group>
  );
}

/* ----------------------------------------------------------------- 03 · regalo */

const GIFT_OPEN_SECONDS = 1.1;
const GIFT_CLOSE_SECONDS = 0.8;

function Gift({ active }) {
  const { model, animations } = useCleanModel(MODELS.gift, { resetPose: false });
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const duration = useMemo(() => Math.max(...animations.map((c) => c.duration)), [animations]);
  const actions = useRef([]);
  const progress = useRef(0);
  const wiggle = useRef();

  // Pose fija en el tiempo t del clip (cerrado = 0, abierto = duración)
  const setPose = useCallback(
    (time) => {
      actions.current.forEach((a) => {
        a.time = Math.min(time, duration - 1e-4);
      });
      mixer.update(0);
    },
    [duration, mixer],
  );

  useLayoutEffect(() => {
    actions.current = animations.map((clip) => mixer.clipAction(clip).play());
    setPose(duration); // abierto, para que Framed lo mida completo; useFrame lo cierra
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      actions.current = [];
    };
  }, [animations, duration, mixer, model, setPose]);

  useFrame(({ clock }, dt) => {
    const step = active ? dt / GIFT_OPEN_SECONDS : -dt / GIFT_CLOSE_SECONDS;
    progress.current = clamp(progress.current + step, 0, 1);
    setPose(progress.current * duration);
    // en reposo se mece un poquito, como invitando a abrirlo
    const idle = 1 - progress.current;
    wiggle.current.rotation.z = Math.sin(clock.elapsedTime * 2.2) * 0.035 * idle;
  });

  // La cámara de Blender miraba 15° desde arriba
  return (
    <group rotation={[0.27, 0, 0]}>
      <group ref={wiggle}>
        <primitive object={model} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------- escena */

const SCENES = {
  gear: { Model: Gear, margin: 1.06 },
  phone: { Model: Phone, margin: 1.4 },
  gift: { Model: Gift, margin: 1.02 },
};

function Rig({ kind, active, onReady }) {
  const { Model, margin } = SCENES[kind];
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <Framed margin={margin}>
      <Model active={active} />
    </Framed>
  );
}

export default function StepScene3D({ kind, active = false, running = true, onReady }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={running ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 30 }}
      gl={GL_PROPS}
    >
      <StudioLights />
      <Suspense fallback={null}>
        <Rig kind={kind} active={active} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODELS.gear, DRACO_PATH);
useGLTF.preload(MODELS.phone, DRACO_PATH);
useGLTF.preload(MODELS.coin, DRACO_PATH);
useGLTF.preload(MODELS.gift, DRACO_PATH);
