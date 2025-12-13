import api from "./api";

export const authService = {
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/auth/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error.response?.data || error.message;
    }
  },

  // Helper interno para guardar sesión
  _saveSession: (token, user, userType, refreshToken, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    otherStorage.removeItem("token");
    otherStorage.removeItem("user");
    otherStorage.removeItem("userType");
    otherStorage.removeItem("refreshToken");

    if (token) {
      const cleanToken = String(token).replace(/^["']|["']$/g, "");
      storage.setItem("token", cleanToken);
    }
    if (user) storage.setItem("user", JSON.stringify(user));
    if (userType) storage.setItem("userType", userType);
    if (refreshToken) storage.setItem("refreshToken", refreshToken);
  },

  getToken: () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr || userStr === "undefined" || userStr === "null") return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },

  loginClient: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.accessToken || response.data.token;
      
      if (token) {
        authService._saveSession(
          token, 
          response.data.user, 
          "client", 
          response.data.refreshToken, 
          rememberMe
        );
      }
      return response.data;
    } catch (error) {
      console.error("Error en loginClient:", error);
      throw error.response?.data || error.message;
    }
  },

  loginBusiness: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post("/business/login", { email, password });
      const token = response.data.accessToken || response.data.token;
      
      if (token) {
        const accountData = response.data.user || response.data.business;
        authService._saveSession(
          token, 
          accountData, 
          "business", 
          null, 
          rememberMe
        );
      }
      return response.data;
    } catch (error) {
      console.error("Error en loginBusiness:", error);
      throw error.response?.data || error.message;
    }
  },

  login: async (email, password, rememberMe = false, userType = "client") => {
    const endpoint = userType === "business" ? "/business/login" : "/auth/login";
    
    try {
      const response = await api.post(endpoint, { email, password });
      const token = response.data.accessToken || response.data.token;
      
      if (token) {
        const userData = userType === "business" 
          ? (response.data.user || response.data.business) 
          : response.data.user;

        authService._saveSession(
          token, 
          userData, 
          userType, 
          response.data.refreshToken, 
          rememberMe 
        );
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  signUpClient: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        // Registro por defecto siempre usa localStorage (true)
        authService._saveSession(token, response.data.user, "client", null, true);
      }
      return response.data;
    } catch (error) {
      console.error("Error en signUpClient:", error);
      throw error.response?.data || error.message;
    }
  },

  signUpBusiness: async (userData) => {
    try {
      const response = await api.post("/business/register", userData);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        const accountData = response.data.user || response.data.business;
        authService._saveSession(token, accountData, "business", null, true);
      }
      return response.data;
    } catch (error) {
      console.error("Error en signUpBusiness:", error);
      throw error.response?.data || error.message;
    }
  },

  signUp: async (userData) => {
    if (userData.userType === "business") {
      return authService.signUpBusiness(userData);
    }
    return authService.signUpClient(userData);
  },

  resendVerificationClient: async () => {
    try {
      const response = await api.post("/auth/resend-verification");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resendVerificationBusiness: async () => {
    try {
      const response = await api.post("/business/resend-verification");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resendVerification: async () => {
    const userType = authService.getUserType();
    if (userType === "business") {
      return authService.resendVerificationBusiness();
    }
    return authService.resendVerificationClient();
  },

  refreshClient: async (refreshToken) => {
    try {
      const response = await api.post("/auth/refresh", { refreshToken });
      const token = response.data.accessToken || response.data.token;
      if (token) {
        // Actualizar donde exista
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("token", token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  refreshBusiness: async (refreshToken) => {
    try {
      const response = await api.post("/business/refresh", { refreshToken });
      const token = response.data.accessToken || response.data.token;
      if (token) {
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("token", token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logoutClient: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      authService.clearStorage();
    }
  },

  logoutBusiness: async () => {
    try {
      await api.post("/business/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      authService.clearStorage();
    }
  },

  logout: async () => {
    const userType = localStorage.getItem("userType") || sessionStorage.getItem("userType");
    const endpoint = userType === "business" ? "/business/logout" : "/auth/logout";
    
    try {
      await api.post(endpoint);
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
    }
  },

  clearStorage: () => {
    const keys = ["token", "user", "userType", "refreshToken"];
    keys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
  },

  getUserType: () => {
    const userType = localStorage.getItem("userType") || sessionStorage.getItem("userType");
    if (!userType || userType === "undefined" || userType === "null") {
      return null;
    }
    return userType;
  },

  isAuthenticated: () => {
    return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
  },

  getMeClient: async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data) {
        const storage = sessionStorage.getItem("token") ? sessionStorage : localStorage;
        storage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMeBusiness: async () => {
    try {
      const response = await api.get("/business/me");
      const data = response.data.business || response.data;
      if (data) {
        const storage = sessionStorage.getItem("token") ? sessionStorage : localStorage;
        storage.setItem("user", JSON.stringify(data));
      }
      return data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMe: async () => {
    const userType = authService.getUserType();
    if (userType === "business") {
      return authService.getMeBusiness();
    }
    return authService.getMeClient();
  },
};

export default authService;