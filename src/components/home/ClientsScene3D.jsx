/* eslint-disable react/no-unknown-property -- las props de react-three-fiber
   (position, intensity, object, ...) no son atributos del DOM. */
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { Framed } from './Framed';
import { DRACO_PATH, GL_PROPS, MODELS, useCleanModel } from './scene3d';
import { StudioLights } from './StudioLights';

/*
 * Mano con el teléfono de "Para clientes". Cuando `play` pasa a true:
 *   1. la mano entra desde abajo sosteniendo el teléfono con la pantalla vacía
 *   2. el pulgar toca el botón ámbar de la pantalla (onda + el botón se hunde)
 *   3. el QR se abre desde el centro de la tarjeta y aparecen las monedas
 * Después se queda flotando. Cada cambio de `replay` repite el toque.
 */

const { clamp, lerp } = THREE.MathUtils;
const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};
const easeOutCubic = (x) => 1 - (1 - x) ** 3;
const easeInCubic = (x) => x ** 3;
const progress = (t, start, dur) => clamp((t - start) / dur, 0, 1);

// Tiempos (segundos desde que empieza)
const T = {
  enter: { start: 0, dur: 1.0 },
  press: { start: 1.05, dur: 0.3 }, // el pulgar baja
  hold: 0.12,
  release: 0.45, // el pulgar sube
  reveal: 0.75, // el QR se abre
  coinGap: 0.12,
  coinDur: 0.55,
};
T.contact = T.press.start + T.press.dur;
T.coins = T.contact + 0.6;
T.idle = T.coins + 2 * T.coinGap + T.coinDur;
const REPLAY_FROM = 0.9; // al repetir se salta la entrada
const THUMB_LIFT = 0.5; // rad: el pulgar en reposo, separado de la pantalla
// Punto donde la yema toca el botón (espacio del grupo mano+teléfono, glTF)
const CONTACT = new THREE.Vector3(0.17, 0.079, 0.6);

/** Recorta el QR por distancia al centro de la tarjeta: se "abre" de adentro hacia afuera. */
function makeRevealMaterial(source, uniforms) {
  const mat = source.clone();
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRevealPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRevealPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRevealPos;\nuniform float uReveal;\nuniform vec2 uCenter;\nuniform float uRadius;')
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
        // la pantalla está en el plano XZ del teléfono (glTF: Y arriba)
        if (length(vRevealPos.xz - uCenter) > uReveal * uRadius) discard;`,
      );
  };
  mat.customProgramCacheKey = () => 'rh-qr-reveal';
  return mat;
}

function HandPhone({ play, replay }) {
  const { model } = useCleanModel(MODELS.hand, { resetPose: false });
  const wrap = useRef();
  const startedAt = useRef(null);
  const replayAt = useRef(null);
  const reveal = useMemo(
    () => ({ uReveal: { value: 1 }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 1 } }),
    [],
  );

  const rig = useMemo(() => {
    const get = (name) => model.getObjectByName(name);
    const group = get('RH_HandPhone');
    const thumb = get('RH_Thumb');
    const qr = get('RH_Phone_QR');
    const logo = get('RH_Phone_QRLogo');
    const cta = get('RH_Phone_CTA');
    const coins = ['RH_Coin', 'RH_Coin_1', 'RH_Coin_2'].map(get).map((obj) => ({
      obj,
      pos: obj.position.clone(),
      rot: obj.rotation.clone(),
      scale: obj.scale.clone(),
    }));

    // Eje para levantar el pulgar: perpendicular a su largo y a la normal de la pantalla (+Y)
    const p = thumb.geometry.attributes.position;
    const v = new THREE.Vector3();
    const tip = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 1) {
      v.fromBufferAttribute(p, i);
      if (v.lengthSq() > tip.lengthSq()) tip.copy(v);
    }
    const thumbAxis = tip.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();

    // QR con recorte radial
    qr.geometry.computeBoundingBox();
    const box = qr.geometry.boundingBox;
    reveal.uCenter.value.set((box.min.x + box.max.x) / 2, (box.min.z + box.max.z) / 2);
    reveal.uRadius.value = Math.hypot(box.max.x - box.min.x, box.max.z - box.min.z) / 2 + 0.01;
    qr.material = makeRevealMaterial(qr.material, reveal);

    // Onda del toque, sobre el botón
    const ripples = [0, 1].map(() => {
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(0.82, 1, 48),
        new THREE.MeshBasicMaterial({ color: '#FFFAF0', transparent: true, depthWrite: false, toneMapped: false }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.copy(CONTACT);
      mesh.visible = false;
      group.add(mesh);
      return mesh;
    });

    return {
      group,
      groupPos: group.position.clone(),
      thumb,
      thumbAxis,
      logo,
      logoScale: logo.scale.clone(),
      cta,
      ctaY: cta.position.y,
      coins,
      ripples,
    };
  }, [model, reveal]);

  useEffect(
    () => () => {
      rig.ripples.forEach((r) => {
        r.removeFromParent();
        r.geometry.dispose();
        r.material.dispose();
      });
    },
    [rig],
  );

  // Pose completa (QR y monedas visibles, pulgar levantado) para que Framed mida todo
  useLayoutEffect(() => {
    rig.thumb.quaternion.setFromAxisAngle(rig.thumbAxis, THUMB_LIFT);
    reveal.uReveal.value = 1;
  }, [rig, reveal]);

  // Repetir el toque (hover / tap) una vez terminada la intro
  useEffect(() => {
    if (replay) replayAt.current = 'pending';
  }, [replay]);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    if (play && startedAt.current === null) startedAt.current = now;
    let t = startedAt.current === null ? -1 : now - startedAt.current;

    let replaying = false;
    if (replayAt.current === 'pending') {
      if (t > T.idle) {
        startedAt.current = now - REPLAY_FROM;
        t = REPLAY_FROM;
        replayAt.current = true;
      } else {
        replayAt.current = null; // todavía en la intro: se ignora
      }
    }
    if (replayAt.current === true) {
      if (t > T.idle) replayAt.current = null;
      else replaying = true;
    }

    // 1 · entrada: sube desde abajo con un giro que se asienta
    const pe = progress(t, T.enter.start, T.enter.dur);
    const ke = easeOutBack(pe);
    wrap.current.visible = pe > 0;
    wrap.current.position.y = (1 - ke) * -1.6;
    wrap.current.rotation.z = (1 - ke) * 0.35;
    wrap.current.scale.setScalar(Math.max(lerp(0.75, 1, ke), 1e-4));

    // 2 · el pulgar baja, toca y vuelve a subir
    const down = easeInCubic(progress(t, T.press.start, T.press.dur));
    const up = easeOutCubic(progress(t, T.contact + T.hold, T.release));
    const lift = THUMB_LIFT * (1 - down + up);
    rig.thumb.quaternion.setFromAxisAngle(rig.thumbAxis, lift);

    // al tocar: el botón se hunde, el teléfono cede un poco y sale la onda
    const tap = progress(t, T.contact - 0.04, T.hold + 0.2);
    const dip = Math.sin(Math.PI * tap);
    rig.cta.position.y = rig.ctaY - 0.006 * dip;
    rig.group.position.y = rig.groupPos.y - 0.025 * dip;
    rig.ripples.forEach((ring, i) => {
      const k = progress(t, T.contact + i * 0.14, 0.6);
      ring.visible = k > 0 && k < 1;
      ring.scale.setScalar(lerp(0.04, 0.3, easeOutCubic(k)));
      ring.material.opacity = 0.95 * (1 - k);
    });

    // 3 · el QR se abre desde el centro (al repetir, primero se borra rápido)
    let open = easeOutCubic(progress(t, T.contact + 0.05, T.reveal));
    if (replaying && t < T.contact + 0.05) open = 1 - progress(t, REPLAY_FROM, 0.18);
    reveal.uReveal.value = open;
    const pl = progress(t, T.contact + T.reveal * 0.55, 0.4);
    const logoK = replaying && t < T.contact ? 1 - progress(t, REPLAY_FROM, 0.18) : easeOutBack(pl);
    rig.logo.visible = logoK > 0.001;
    rig.logo.scale.copy(rig.logoScale).multiplyScalar(Math.max(logoK, 1e-4));

    // monedas: saltan una por una y luego flotan girando
    const idle = clamp((t - T.idle) / 0.8, 0, 1);
    rig.coins.forEach((c, i) => {
      const k = replaying ? 1 : easeOutBack(progress(t, T.coins + i * T.coinGap, T.coinDur));
      c.obj.visible = k > 0.001;
      c.obj.scale.copy(c.scale).multiplyScalar(Math.max(k, 1e-4));
      c.obj.position.y = c.pos.y + Math.sin(now * 1.3 + i * 2) * 0.06 * idle;
      c.obj.rotation.set(c.rot.x, c.rot.y + Math.sin(now * 0.8 + i) * 0.35 * idle, c.rot.z);
    });

    // flotado suave de todo el conjunto
    wrap.current.position.y += Math.sin(now * 1.1) * 0.04 * idle;
    wrap.current.rotation.y = Math.sin(now * 0.4) * 0.06 * idle;
  });

  return (
    <group ref={wrap}>
      <primitive object={model} />
    </group>
  );
}

function Rig({ play, replay, onReady }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <Framed margin={1}>
      <HandPhone play={play} replay={replay} />
    </Framed>
  );
}

export default function ClientsScene3D({ play = false, replay = 0, running = true, onReady }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={running ? 'always' : 'never'}
      camera={{ position: [0, 0, 8], fov: 26 }}
      gl={GL_PROPS}
    >
      <StudioLights />
      <Suspense fallback={null}>
        <Rig play={play} replay={replay} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODELS.hand, DRACO_PATH);
