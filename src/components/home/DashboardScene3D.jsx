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
 * Dashboard 3D de "Funciones". Cuando `play` pasa a true se arma por partes:
 *   1. la base salta desde abajo
 *   2. los componentes internos brincan uno por uno
 *   3. las barras crecen escalonadas y, al mismo tiempo, el aro de la dona se
 *      dibuja como una manecilla de reloj
 * Después se queda vivo: las tarjetas flotantes suben y bajan.
 */

const { clamp, lerp } = THREE.MathUtils;
const TAU = Math.PI * 2;

const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const progress = (t, start, dur) => clamp((t - start) / dur, 0, 1);

// Piezas en el orden en que aparecen (prefijos de los nodos del GLB)
const BASE = 'Dash_Panel';
const PIECES = [
  ['Dash_Sidebar', 'Dash_Logo', 'Dash_Nav_'],
  ['Dash_Title_'],
  ['Dash_KPI_0'],
  ['Dash_KPI_1'],
  ['Dash_KPI_2'],
  ['Dash_ChartCard', 'Dash_Chart_t_', 'Dash_Bar_'],
  ['Dash_DonutCard', 'Dash_Donut'],
  ['Dash_Float_Points'],
  ['Dash_Float_Client'],
  ['RH_Coin'],
];
const FLOATERS = new Set(['Dash_Float_Points', 'Dash_Float_Client', 'RH_Coin']);

// Tiempos (segundos desde que empieza)
const T = {
  base: { start: 0, dur: 0.7 },
  pieceStart: 0.45,
  pieceGap: 0.13,
  pieceDur: 0.55,
  hop: 0.32, // altura del brinco de cada pieza
  barGap: 0.09,
  barDur: 0.65,
};
T.final = T.pieceStart + (PIECES.length - 1) * T.pieceGap + T.pieceDur * 0.6;
T.sweepDur = 6 * T.barGap + T.barDur; // termina junto con la última barra
T.end = T.final + T.sweepDur;

// La dona se modeló con el 68 % del aro en ámbar, desde el ángulo 0 en sentido antihorario.
// La manecilla arranca donde termina el ámbar y avanza en sentido horario.
const SWEEP_START = TAU * 0.68;

/** Recorta el aro por ángulo: solo se ve la parte que la "manecilla" ya recorrió. */
function makeSweepMaterial(source, uniform) {
  const mat = source.clone();
  mat.side = THREE.DoubleSide; // el corte deja ver el interior del aro
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSweep = uniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSweepPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSweepPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSweepPos;\nuniform float uSweep;')
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
        // glTF: Y arriba, así que el plano del aro es XZ (el Y de Blender es -Z)
        float sweepAngle = atan(-vSweepPos.z, vSweepPos.x);
        float sweepCw = mod(${SWEEP_START.toFixed(5)} - sweepAngle, ${TAU.toFixed(5)});
        if (sweepCw > uSweep * ${TAU.toFixed(5)}) discard;`,
      );
  };
  mat.customProgramCacheKey = () => 'rh-donut-sweep';
  return mat;
}

function Dashboard({ play }) {
  const { model } = useCleanModel(MODELS.dashboard, { resetPose: false });
  const sweep = useMemo(() => ({ value: 1 }), []);
  const sway = useRef();
  const startedAt = useRef(null);

  // Arma la lista de piezas con su pose final (la que trae el GLB, con barras completas)
  const rig = useMemo(() => {
    const root = model.getObjectByName('RH_Dashboard');
    const snap = (obj) => ({ obj, pos: obj.position.clone(), scale: obj.scale.clone() });
    const groups = PIECES.map(() => []);
    let base = null;
    const bars = [];
    root.children.forEach((obj) => {
      if (obj.name === BASE) {
        base = snap(obj);
        return;
      }
      const g = PIECES.findIndex((prefixes) => prefixes.some((p) => obj.name.startsWith(p)));
      if (g < 0) return;
      const entry = snap(obj);
      if (obj.name.startsWith('Dash_Bar_')) {
        // El GLB trae las barras aplastadas (escala Y 0.05); la malla es la barra completa
        const box = new THREE.Box3().setFromBufferAttribute(obj.geometry.attributes.position);
        entry.height = box.max.y - box.min.y;
        entry.baseY = obj.position.y - entry.height * obj.scale.y * 0.5;
        entry.scale.y = 1;
        bars.push(entry);
      }
      groups[g].push(entry);
    });
    bars.sort((a, b) => a.pos.x - b.pos.x);
    const pieces = groups.map((entries) => ({
      entries,
      anchor: entries[0].pos.clone(),
      floats: entries.some((e) => FLOATERS.has(e.obj.name)),
    }));

    // Aro con recorte por ángulo
    root.getObjectByName('Dash_Donut')?.traverse((o) => {
      if (o.isMesh) o.material = makeSweepMaterial(o.material, sweep);
    });
    return { base, pieces, bars };
  }, [model, sweep]);

  /** Coloca una pieza: brinco (dy), escala (s) alrededor de su ancla y crecimiento de barras (grow). */
  const place = (piece, s, dy, grow = 1, bob = 0) => {
    piece.entries.forEach((e) => {
      const { obj, pos, scale } = e;
      obj.visible = s > 0.001;
      obj.position.set(
        piece.anchor.x + (pos.x - piece.anchor.x) * s,
        piece.anchor.y + (pos.y - piece.anchor.y) * s + dy + bob,
        piece.anchor.z + (pos.z - piece.anchor.z) * s,
      );
      if (e.height) {
        const sy = lerp(0.05, 1, grow);
        obj.scale.set(scale.x * s, sy * s, scale.z * s);
        obj.position.y = piece.anchor.y + (e.baseY + (e.height * sy) / 2 - piece.anchor.y) * s + dy;
      } else {
        obj.scale.copy(scale).multiplyScalar(Math.max(s, 1e-4));
      }
    });
  };

  // Pose final completa para que Framed mida todo; useFrame la oculta en el siguiente cuadro
  useLayoutEffect(() => {
    rig.base.obj.position.copy(rig.base.pos);
    rig.base.obj.scale.copy(rig.base.scale);
    rig.pieces.forEach((p) => place(p, 1, 0, 1));
    sweep.value = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, [rig]);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    if (play && startedAt.current === null) startedAt.current = now;
    const t = startedAt.current === null ? -1 : now - startedAt.current;

    // 1 · base: sube desde abajo con rebote
    const pb = progress(t, T.base.start, T.base.dur);
    const kb = easeOutBack(pb);
    rig.base.obj.visible = pb > 0;
    rig.base.obj.position.set(rig.base.pos.x, rig.base.pos.y - (1 - kb) * 0.5, rig.base.pos.z);
    rig.base.obj.scale.copy(rig.base.scale).multiplyScalar(Math.max(lerp(0.6, 1, kb), 1e-4) * (pb > 0 ? 1 : 0));

    // 3 · barras escalonadas (se calculan antes para pasarlas a su pieza)
    const grow = rig.bars.map((_, i) => easeOutBack(progress(t, T.final + i * T.barGap, T.barDur)));

    // 2 · piezas una por una: escala con rebote + brinco parabólico
    rig.pieces.forEach((piece, i) => {
      const p = progress(t, T.pieceStart + i * T.pieceGap, T.pieceDur);
      const s = easeOutBack(Math.min(p / 0.7, 1));
      const dy = 4 * T.hop * p * (1 - p);
      const bob = piece.floats
        ? Math.sin(now * 1.4 + i) * 0.05 * clamp((t - T.end) / 0.8, 0, 1)
        : 0;
      place(piece, p > 0 ? s : 0, dy, 1, bob);
      // las barras viven en la pieza de la gráfica: aplica su crecimiento individual
      piece.entries.forEach((e) => {
        if (!e.height || p === 0) return;
        const k = rig.bars.indexOf(e);
        const sy = lerp(0.05, 1, grow[k]);
        e.obj.scale.y = sy * s;
        e.obj.position.y = piece.anchor.y + (e.baseY + (e.height * sy) / 2 - piece.anchor.y) * s + dy;
      });
    });

    // 3 · el aro se dibuja como manecilla, al mismo tiempo que las barras
    sweep.value = easeInOutCubic(progress(t, T.final, T.sweepDur));

    // vaivén suave de todo el conjunto
    sway.current.rotation.y = Math.sin(now * 0.3) * 0.04;
  });

  // La cámara de Blender era ortográfica y miraba ~38° desde arriba: inclinamos el modelo
  return (
    <group rotation={[0.66, 0, 0]}>
      <group ref={sway}>
        <primitive object={model} />
      </group>
    </group>
  );
}

function Rig({ play, onReady }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <Framed margin={1.04}>
      <Dashboard play={play} />
    </Framed>
  );
}

export default function DashboardScene3D({ play = false, running = true, onReady }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={running ? 'always' : 'never'}
      // fov cerrado: casi isométrico, como el render ortográfico de Blender
      camera={{ position: [0, 0, 12], fov: 18 }}
      gl={GL_PROPS}
    >
      <StudioLights />
      <Suspense fallback={null}>
        <Rig play={play} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODELS.dashboard, DRACO_PATH);
