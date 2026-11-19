import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/*
 * Utilidades compartidas por las escenas 3D de la landing (hero y "Cómo funciona").
 * Los modelos salen de design/3d en el repo del back (Blender → GLB con Draco).
 */

export const DRACO_PATH = '/draco/'; // decoder servido localmente, sin CDN

export const MODELS = {
  phone: '/models/rh_phone.glb',
  coin: '/models/rh_coin.glb',
  gear: '/models/rh_gear.glb',
  gift: '/models/rh_gift.glb',
  dashboard: '/models/rh_dashboard.glb',
  hand: '/models/rh_hand.glb',
};

// Los GLB vienen en espacio glTF (Y arriba) con la pantalla/cara mirando a +Y.
// Girando +90° en X queda de frente a la cámara (+Z) y con el alto hacia +Y.
export const FACE_CAMERA = new THREE.Euler(Math.PI / 2, 0, 0);

export const GL_PROPS = {
  antialias: true,
  alpha: true,
  toneMapping: THREE.NoToneMapping,
  outputColorSpace: THREE.SRGBColorSpace,
};

/**
 * Clona el modelo (para poder usarlo en varias escenas) y, si se pide, quita la
 * pose con la que se renderizó en Blender para controlarla desde aquí.
 */
export function useCleanModel(url, { resetPose = true } = {}) {
  const gltf = useGLTF(url, DRACO_PATH);
  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    if (resetPose) root.children.forEach((c) => c.rotation.set(0, 0, 0));
    return root;
  }, [gltf.scene, resetPose]);
  return { model, animations: gltf.animations };
}
