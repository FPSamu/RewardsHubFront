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

  loginClient: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Respuesta del login:", response.data);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        const cleanToken = String(token).replace(/^["']|["']$/g, "");
        localStorage.setItem("token", cleanToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userType", "client");
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
      }
      return response.data;
    } catch (error) {
      console.error("Error en loginClient:", error);
      throw error.response?.data || error.message;
    }
  },

  loginBusiness: async (email, password) => {
    try {
      const response = await api.post("/business/login", { email, password });
      console.log("Respuesta del login business:", response.data);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        const cleanToken = String(token).replace(/^["']|["']$/g, "");
        localStorage.setItem("token", cleanToken);

        const accountData = response.data.user || response.data.business;

        if (accountData) {
            localStorage.setItem("user", JSON.stringify(accountData));
        } else {
            console.warn("Advertencia: No se encontraron datos de cuenta en la respuesta");
        }

        localStorage.setItem("userType", "business");
      }
      return response.data;
    } catch (error) {
      console.error("Error en loginBusiness:", error);
      throw error.response?.data || error.message;
    }
  },

  login: async (email, password, userType = "client") => {
    if (userType === "business") {
      return authService.loginBusiness(email, password);
    }
    return authService.loginClient(email, password);
  },

  signUpClient: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        const cleanToken = String(token).replace(/^["']|["']$/g, "");
        localStorage.setItem("token", cleanToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userType", "client");
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
        const cleanToken = String(token).replace(/^["']|["']$/g, "");
        localStorage.setItem("token", cleanToken);

        const accountData = response.data.user || response.data.business;

        if (accountData) {
            localStorage.setItem("user", JSON.stringify(accountData));
        }

        localStorage.setItem("userType", "business");
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
    const userType = localStorage.getItem("userType");
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
        localStorage.setItem("token", token);
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
        localStorage.setItem("token", token);
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
    const userType = localStorage.getItem("userType");
    if (userType === "business") {
      return authService.logoutBusiness();
    }
    return authService.logoutClient();
  },

  clearStorage: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("refreshToken");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr || userStr === "undefined" || userStr === "null") {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  getUserType: () => {
    const userType = localStorage.getItem("userType");
    if (!userType || userType === "undefined" || userType === "null") {
      return null;
    }
    return userType;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getMeClient: async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
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
        localStorage.setItem("user", JSON.stringify(data));
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