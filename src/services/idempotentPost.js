import api, { parseRetryAfterMs } from './api';

// POST con Idempotency-Key para las acciones que mueven saldo.
//
// La llave la genera el componente una vez por acción del usuario (ver
// hooks/useIdempotencyKey.js) y llega aquí como parámetro; este helper solo la
// manda y la reutiliza en los reintentos automáticos de esa misma petición:
//   - 409 con Retry-After: la misma operación sigue en proceso en el backend.
//   - Error de red / timeout / 5xx: no sabemos si se aplicó; la misma llave
//     evita que se aplique dos veces.
// Máximo MAX_ATTEMPTS intentos en total; después se muestra el error.
//
// Una respuesta con "Idempotent-Replayed: true" es la original repetida y se
// trata como éxito normal (no hace falta hacer nada distinto).

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

const GENERIC_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo.';
const STILL_IN_PROGRESS = 'La operación sigue en proceso. Espera unos segundos e inténtalo de nuevo.';

// Llaves cuya operación quedó sin respuesta definitiva (red, 5xx, 409): un
// reintento manual de esa misma operación debe reutilizarlas.
const unresolvedKeys = new Set();
export const isKeyUnresolved = (key) => unresolvedKeys.has(key);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isUnresolved = (error) => {
  if (error?.code === 'ERR_CANCELED') return false;
  const status = error?.response?.status;
  return !error?.response || status >= 500 || status === 409;
};

// Milisegundos a esperar antes del siguiente intento, o null si no se reintenta
const retryDelayMs = (error, attempt) => {
  if (error?.code === 'ERR_CANCELED') return null;
  const status = error?.response?.status;
  if (!error?.response || status >= 500) return BASE_DELAY_MS * 2 ** (attempt - 1);
  if (status === 409) return parseRetryAfterMs(error.response.headers?.['retry-after']);
  return null; // 4xx de negocio ("Insufficient points"), 422, 400, 429...
};

const setErrorMessage = (error, message) => {
  error.message = message;
  if (error.response) {
    const data = error.response.data;
    error.response.data = data && typeof data === 'object' ? { ...data, message } : { message };
  }
};

export const idempotentPost = async (url, body, idempotencyKey, config = {}) => {
  if (!idempotencyKey) {
    throw new Error(`[Idempotency] Falta la Idempotency-Key en ${url}`);
  }
  unresolvedKeys.delete(idempotencyKey);

  const requestConfig = {
    ...config,
    headers: { ...config.headers, 'Idempotency-Key': idempotencyKey },
  };

  for (let attempt = 1; ; attempt++) {
    try {
      return await api.post(url, body, requestConfig);
    } catch (error) {
      const delay = attempt < MAX_ATTEMPTS ? retryDelayMs(error, attempt) : null;
      if (delay !== null && delay !== undefined) {
        await wait(delay);
        continue;
      }

      const status = error?.response?.status;
      if (isUnresolved(error)) unresolvedKeys.add(idempotencyKey);

      if (status === 409) {
        setErrorMessage(error, STILL_IN_PROGRESS);
      } else if (status === 422) {
        // Misma llave con otro body: es un bug del front
        console.error(`[Idempotency] 422 en ${url}: la Idempotency-Key ya se usó con otro body`, error.response?.data);
        setErrorMessage(error, GENERIC_ERROR);
      } else if (status === 400 && /idempotency-key/i.test(error.response?.data?.message ?? '')) {
        // Llave vacía o > 255 caracteres: no debería pasar con newIdempotencyKey()
        console.error(`[Idempotency] 400 en ${url}:`, error.response?.data?.message);
        setErrorMessage(error, GENERIC_ERROR);
      }
      throw error;
    }
  }
};

export default idempotentPost;
