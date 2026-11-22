// UUID v4 para el header Idempotency-Key.
// No usar crypto.randomUUID(): solo existe en HTTPS o localhost, y el front del
// lab corre por HTTP (S3 sin CloudFront). crypto.getRandomValues sí funciona.
export const newIdempotencyKey = () => {
  const b = globalThis.crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // versión 4
  b[8] = (b[8] & 0x3f) | 0x80; // variante RFC 4122
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

export default newIdempotencyKey;
