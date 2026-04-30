import axios from 'axios';
import * as adminPinService from './adminPinService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request: attach tokens ───────────────────────────────────────────────────

// These endpoints handle their own auth (Firebase idToken in body) — never send a stale JWT
const NO_AUTH_HEADER_URLS = ['/auth/login', '/auth/register', '/auth/check-email'];

api.interceptors.request.use((config) => {
  const isPublicAuthEndpoint = NO_AUTH_HEADER_URLS.some((u) => config.url?.includes(u));

  if (!isPublicAuthEndpoint) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  const adminToken = adminPinService.getToken();
  if (adminToken) config.headers['x-admin-token'] = adminToken;

  return config;
});

// ─── Response: auto-refresh on 401 ───────────────────────────────────────────

// Endpoints that must NOT trigger a refresh attempt
const NO_REFRESH_URLS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/logout', '/auth/check-email'];

let isRefreshing = false;
let pendingQueue = []; // requests waiting for a new token

const drainQueue = (newToken) => {
  pendingQueue.forEach(({ resolve }) => resolve(newToken));
  pendingQueue = [];
};

const rejectQueue = (err) => {
  pendingQueue.forEach(({ reject }) => reject(err));
  pendingQueue = [];
};

const clearAndRedirect = () => {
  ['token', 'refreshToken', 'user', 'role', 'userType'].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  window.location.href = '/login';
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── 401 handling with token refresh ──────────────────────────────────────
    const isNoRefresh = NO_REFRESH_URLS.some((u) => originalRequest.url?.includes(u));

    if (status === 401 && !originalRequest._retry && !isNoRefresh) {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

      if (!refreshToken) {
        clearAndRedirect();
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh', { refreshToken });
        const { token: newToken, refreshToken: newRefresh } = res.data;

        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('token', newToken);
        storage.setItem('refreshToken', newRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        drainQueue(newToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        rejectQueue(refreshErr);
        isRefreshing = false;
        clearAndRedirect();
        return Promise.reject(refreshErr);
      }
    }

    // ── Admin PIN expired ─────────────────────────────────────────────────────
    if (
      status === 403 &&
      error.response?.data?.message?.toLowerCase().includes('pin')
    ) {
      adminPinService.clearToken();
      adminPinService.dispatchPinRequired();
    }

    return Promise.reject(error);
  },
);

export default api;
