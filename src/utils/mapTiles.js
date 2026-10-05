/**
 * Capa base compartida por los mapas de Leaflet.
 *
 * Vivía duplicada en cada pantalla apuntando a CARTO, hasta que CARTO empezó a
 * exigir API key para sus basemaps públicos y los mapas se llenaron de tiles
 * "API KEY REQUIRED". El fallo fue silencioso: CARTO responde 200 con ese PNG
 * en vez de un 401, así que Leaflet daba el tile por bueno.
 *
 * Centralizado aquí para que el próximo cambio de proveedor sea un solo sitio.
 *
 * Esri World Light Gray Canvas: sin API key y con el mismo gris claro que
 * teníamos. Ojo con el orden de la plantilla — Esri usa {z}/{y}/{x}, con la y
 * antes que la x, y no admite {s} (subdominios) ni {r} (retina).
 */
export const TILE_URL =
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

export const TILE_ATTRIBUTION =
    '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors';
