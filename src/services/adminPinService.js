import api from './api';

// Token stored in memory only — never persisted to localStorage
let _adminToken = null;

export const getToken = () => _adminToken;
export const setToken = (token) => { _adminToken = token; };
export const clearToken = () => { _adminToken = null; };
export const hasToken = () => !!_adminToken;

export const verifyPin = async (pin) => {
  const { data } = await api.post('/business/admin-pin/verify', { pin });
  if (data.adminToken) setToken(data.adminToken);
  return data; // { success, isTemporary, adminToken }
};

export const changePin = async (currentPin, newPin) => {
  const { data } = await api.post('/business/admin-pin/change', { currentPin, newPin });
  return data;
};

// Dispatched by api.js when a 403 "PIN" error is received
export const dispatchPinRequired = () => {
  window.dispatchEvent(new CustomEvent('adminPinRequired'));
};
