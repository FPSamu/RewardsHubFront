import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import api from './api';

// ─── Storage keys ────────────────────────────────────────────────────────────

const KEYS = ['token', 'refreshToken', 'user', 'role'];

// Map API role ('user' | 'business') to the internal key used by ProtectedRoutes
const toInternalRole = (apiRole) => (apiRole === 'user' ? 'client' : apiRole);

// ─── Firebase error → human-readable Spanish message ────────────────────────

const firebaseMessage = (code) => {
  const map = {
    'auth/user-not-found':      'No existe una cuenta con ese correo.',
    'auth/wrong-password':      'Contraseña incorrecta.',
    'auth/invalid-credential':  'Correo o contraseña incorrectos.',
    'auth/email-already-in-use':'Este correo ya está registrado. Inicia sesión.',
    'auth/weak-password':       'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email':       'El correo electrónico no es válido.',
    'auth/popup-closed-by-user':'Cerraste la ventana de Google antes de completar.',
    'auth/network-request-failed': 'Error de red. Revisa tu conexión.',
    'auth/too-many-requests':   'Demasiados intentos fallidos. Intenta más tarde.',
  };
  return map[code] || 'Error de autenticación. Intenta de nuevo.';
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

const getStorage = () =>
  localStorage.getItem('token') ? localStorage : sessionStorage;

const saveSession = ({ token, refreshToken, user, apiRole }, rememberMe) => {
  if (!apiRole) throw new Error('saveSession: apiRole is required — check API response shape');

  const storage = rememberMe ? localStorage  : sessionStorage;
  const evicted = rememberMe ? sessionStorage : localStorage;
  KEYS.forEach((k) => evicted.removeItem(k));
  evicted.removeItem('userType');

  const role = toInternalRole(apiRole);
  if (token)        storage.setItem('token',        token);
  if (refreshToken) storage.setItem('refreshToken', refreshToken);
  if (user)         storage.setItem('user',         JSON.stringify(user));
  storage.setItem('role',     role);
  storage.setItem('userType', role);
};

// ─── Public service ───────────────────────────────────────────────────────────

const authService = {

  // ── Getters ────────────────────────────────────────────────────────────────

  getToken: () =>
    localStorage.getItem('token') || sessionStorage.getItem('token'),

  getRefreshToken: () =>
    localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken'),

  getCurrentUser: () => {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!raw || raw === 'null' || raw === 'undefined') return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  // Returns 'client' | 'business' (internal key)
  getUserType: () => {
    const v = localStorage.getItem('role')
           || sessionStorage.getItem('role')
           || localStorage.getItem('userType')
           || sessionStorage.getItem('userType');
    return (!v || v === 'null' || v === 'undefined') ? null : v;
  },

  isAuthenticated: () => !!authService.getToken(),

  clearStorage: () => {
    [...KEYS, 'userType'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },

  // ── Email check ─────────────────────────────────────────────────────────────

  checkEmail: async (email) => {
    const res = await api.post('/auth/check-email', { email });
    return res.data; // { exists, role? }
  },

  // ── Email / Password login ──────────────────────────────────────────────────

  login: async (email, password, rememberMe = false) => {
    try {
      // 1. Firebase authentication
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();

      // 2. Exchange Firebase idToken for our JWT
      const res = await api.post('/auth/login', { idToken });
      const { token, refreshToken, user, role } = res.data;

      saveSession({ token, refreshToken, user, apiRole: role }, rememberMe);
      return res.data;
    } catch (err) {
      // Translate Firebase codes → Spanish. Re-throw API errors as-is.
      if (err.code) throw new Error(firebaseMessage(err.code));
      throw err.response?.data || err;
    }
  },

  // ── Email / Password signup ─────────────────────────────────────────────────

  register: async ({ email, password, role, username }, rememberMe = true) => {
    // 'role' must be 'user' | 'business' (API values)
    try {
      // 0. Check if email already has a MongoDB account
      const check = await authService.checkEmail(email);
      if (check.exists) {
        throw new Error('Este correo ya tiene una cuenta. Inicia sesión.');
      }

      // 1. Create Firebase account
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();

      // 2. Register in our backend
      const body = { idToken, role };
      if (username) body.username = username;
      const res = await api.post('/auth/register', body);
      const { token, refreshToken, user } = res.data;

      saveSession({ token, refreshToken, user, apiRole: role }, rememberMe);
      return res.data;
    } catch (err) {
      if (err.code) throw new Error(firebaseMessage(err.code));
      throw err.response?.data || err;
    }
  },

  // ── Google login ────────────────────────────────────────────────────────────

  loginWithGoogle: async (rememberMe = false) => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken    = await credential.user.getIdToken();

      const res = await api.post('/auth/login', { idToken });
      const { token, refreshToken, user, role } = res.data;

      saveSession({ token, refreshToken, user, apiRole: role }, rememberMe);
      return res.data;
    } catch (err) {
      if (err.code) throw new Error(firebaseMessage(err.code));
      if (err.response?.status === 409) {
        await signOut(auth).catch(() => {});
      }
      throw err.response?.data || err;
    }
  },

  // ── Google signup ───────────────────────────────────────────────────────────

  registerWithGoogle: async (role, rememberMe = true) => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken    = await credential.user.getIdToken();

      const res = await api.post('/auth/register', { idToken, role });
      const { token, refreshToken, user } = res.data;

      saveSession({ token, refreshToken, user, apiRole: role }, rememberMe);
      return res.data;
    } catch (err) {
      if (err.code) throw new Error(firebaseMessage(err.code));
      if (err.response?.status === 409) {
        await signOut(auth).catch(() => {});
        throw new Error('Este correo ya tiene una cuenta. Inicia sesión.');
      }
      throw err.response?.data || err;
    }
  },

  // ── Token refresh (called by api.js interceptor) ────────────────────────────

  refresh: async () => {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const res      = await api.post('/auth/refresh', { refreshToken });
    const storage  = getStorage();
    storage.setItem('token',        res.data.token);
    storage.setItem('refreshToken', res.data.refreshToken);
    return res.data.token;
  },

  // ── Logout ──────────────────────────────────────────────────────────────────

  logout: async () => {
    const refreshToken = authService.getRefreshToken();
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      authService.clearStorage();
    }
  },

  // ── Me ───────────────────────────────────────────────────────────────────────

  getMe: async () => {
    const res = await api.get('/auth/me');
    if (res.data) getStorage().setItem('user', JSON.stringify(res.data));
    return res.data;
  },

  // ── Legacy aliases (used by dashboard components) ──────────────────────────

  signUpClient: (userData) =>
    authService.register({
      email:    userData.email,
      password: userData.password,
      role:     'user',
      username: userData.username,
    }),

  signUpBusiness: (userData) =>
    authService.register({
      email:    userData.email,
      password: userData.password,
      role:     'business',
      username: userData.name,
    }),

  getMeClient:    () => authService.getMe(),
  getMeBusiness:  () => authService.getMe(),

  resendVerification: async () => {
    const res = await api.post('/auth/resend-verification');
    return res.data;
  },
};

export { authService };
export default authService;
