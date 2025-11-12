import api from './api';

export const authService = {
  // Login - Cliente (usa /auth/login)
  loginClient: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'client');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login - Negocio (usa /business/login)
  loginBusiness: async (email, password) => {
    try {
      const response = await api.post('/business/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'business');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login genérico (detecta el tipo de usuario y usa la ruta correcta)
  login: async (email, password, userType = 'client') => {
    if (userType === 'business') {
      return authService.loginBusiness(email, password);
    }
    return authService.loginClient(email, password);
  },

  // Sign Up - Cliente (usa /auth/register)
  signUpClient: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'client');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Sign Up - Negocio (usa /business/register)
  signUpBusiness: async (userData) => {
    try {
      const response = await api.post('/business/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'business');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Sign Up genérico (detecta el tipo y usa la ruta correcta)
  signUp: async (userData) => {
    if (userData.userType === 'business') {
      return authService.signUpBusiness(userData);
    }
    return authService.signUpClient(userData);
  },

  // Refresh Token - Cliente
  refreshClient: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refresh Token - Negocio
  refreshBusiness: async (refreshToken) => {
    try {
      const response = await api.post('/business/refresh', { refreshToken });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout - Cliente
  logoutClient: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      authService.clearStorage();
    }
  },

  // Logout - Negocio
  logoutBusiness: async () => {
    try {
      await api.post('/business/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      authService.clearStorage();
    }
  },

  // Logout genérico
  logout: async () => {
    const userType = localStorage.getItem('userType');
    if (userType === 'business') {
      return authService.logoutBusiness();
    }
    return authService.logoutClient();
  },

  // Limpiar storage
  clearStorage: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get user type
  getUserType: () => {
    return localStorage.getItem('userType') || null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user info (desde el backend)
  getMeClient: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current business info (desde el backend)
  getMeBusiness: async () => {
    try {
      const response = await api.get('/business/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get Me genérico
  getMe: async () => {
    const userType = authService.getUserType();
    if (userType === 'business') {
      return authService.getMeBusiness();
    }
    return authService.getMeClient();
  },
};

export default authService;
