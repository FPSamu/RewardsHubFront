// Sin dependencias de three: lo importan las secciones antes de cargar la escena.

/** ¿El navegador puede crear un contexto WebGL? */
export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}
