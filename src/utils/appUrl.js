/**
 * Base URL of the app.
 * - Local dev  → http://localhost:5173  (from VITE_APP_URL in .env)
 * - Production → https://rewards-hub-opal.vercel.app  (from .env.production)
 *
 * Falls back to window.location.origin so it always works even if the
 * env var is not set.
 */
export const APP_URL =
  import.meta.env.VITE_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://rewards-hub-opal.vercel.app');
