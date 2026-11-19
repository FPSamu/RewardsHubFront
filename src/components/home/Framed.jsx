/* eslint-disable react/no-unknown-property -- props de react-three-fiber */
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Caja de los meshes visibles de `root`, en el espacio local de `root`. */
function measure(root) {
  root.updateWorldMatrix(true, true);
  const inv = root.matrixWorld.clone().invert();
  const box = new THREE.Box3();
  const part = new THREE.Box3();
  const m = new THREE.Matrix4();
  root.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    part.copy(o.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(inv, o.matrixWorld));
    box.union(part);
  });
  return box;
}

/**
 * Centra el contenido y aleja la cámara lo justo para que quepa en el lienzo.
 * Mide una sola vez al montar: los modelos dejan lista su pose "más grande"
 * en su propio useLayoutEffect (que corre antes que el de este padre).
 */
export function Framed({ margin, children }) {
  const camera = useThree((s) => s.camera);
  const { width, height } = useThree((s) => s.size);
  const inner = useRef();
  const box = useRef(null);

  const apply = useCallback(() => {
    if (!box.current) return;
    const center = box.current.getCenter(new THREE.Vector3());
    const size = box.current.getSize(new THREE.Vector3());
    inner.current.position.copy(center).negate();
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(size.y / 2 / tan, size.x / 2 / (tan * (width / height))) * margin + size.z / 2;
    camera.position.set(0, 0, dist);
    camera.far = dist * 4;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, width, height, margin]);

  useLayoutEffect(() => {
    if (!box.current) box.current = measure(inner.current);
    apply();
  }, [apply]);

  return <group ref={inner}>{children}</group>;
}
