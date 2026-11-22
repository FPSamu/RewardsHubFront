import { useCallback, useMemo, useRef } from 'react';
import { newIdempotencyKey } from '../utils/idempotencyKey';
import { isKeyUnresolved } from '../services/idempotentPost';

/**
 * Una Idempotency-Key por acción del usuario (sumar, canjear, activar, reclamar).
 *
 *   const pointsKey = useIdempotencyKey();
 *   const key = pointsKey.keyFor(payload);   // al confirmar la operación
 *   try { await service(payload, key); } finally { pointsKey.settle(); }
 *
 * - keyFor(payload) devuelve la llave guardada si es la misma operación (mismo
 *   payload) y sigue pendiente; si no, genera una nueva. Así un payload distinto
 *   nunca reutiliza una llave (evita el 422).
 * - settle() se llama al terminar. Si la operación terminó con respuesta
 *   definitiva (éxito o error de negocio 4xx), olvida la llave y la siguiente
 *   acción lleva una nueva: el backend guarda también los 4xx y con la misma
 *   llave repetiría el error. Si quedó sin respuesta (red, 5xx, 409), la
 *   conserva para que el reintento del usuario use la misma.
 */
export const useIdempotencyKey = () => {
  const current = useRef(null); // { key, fingerprint }

  const keyFor = useCallback((payload) => {
    const fingerprint = JSON.stringify(payload ?? null);
    if (!current.current || current.current.fingerprint !== fingerprint) {
      current.current = { key: newIdempotencyKey(), fingerprint };
    }
    return current.current.key;
  }, []);

  const settle = useCallback(() => {
    if (current.current && !isKeyUnresolved(current.current.key)) {
      current.current = null;
    }
  }, []);

  return useMemo(() => ({ keyFor, settle }), [keyFor, settle]);
};

export default useIdempotencyKey;
