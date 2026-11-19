/* eslint-disable react/no-unknown-property -- props de react-three-fiber */

/** Iluminación cálida tipo estudio, la misma en todas las escenas de la landing. */
export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#FFE7C2" />
      <hemisphereLight args={['#FFF4DF', '#3A2A10', 0.6]} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} color="#FFF1D9" />
      <directionalLight position={[-4, 1.5, 2]} intensity={0.6} color="#FFE2B0" />
      <directionalLight position={[-2, 3, -5]} intensity={2.4} color="#FFFFFF" />
      <pointLight position={[0, 0, -1.5]} intensity={6} distance={6} color="#FFB733" />
    </>
  );
}
