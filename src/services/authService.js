import api from "./api";

export const authService = {
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/auth/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error.response?.data || error.message;
    }
  },

  // Login - Cliente (usa /auth/login)
  loginClient: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Respuesta del login:", response.data);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        // Limpiar el token de comillas si las tiene
        const cleanToken = String(token).replace(/^["']|["']$/g, "");
        console.log(
          "Token guardado (primeros 20 chars):",
          cleanToken.substring(0, 20) + "..."
        );
        localStorage.setItem("token", cleanToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userType", "client");
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
      } else {
        console.error("No se recibió token en la respuesta");
      }
      return response.data;
    } catch (error) {
      console.error("Error en loginClient:", error);
      throw error.response?.data || error.message;
    }
  },

  // Login - Negocio (usa /business/login)
  loginBusiness: async (email, password) => {
    try {
      const response = await api.post("/business/login", { email, password });
      console.log("Respuesta del login business:", response.data);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        // Limpiar el token de comillas si las tiene
        const cleanToken = String(token).replace(/^["']|["']$/g, "");
        console.log(
          "Token guardado (primeros 20 chars):",
          cleanToken.substring(0, 20) + "..."
        );
        localStorage.setItem("token", cleanToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userType", "business");
      } else {
        console.error("No se recibió token en la respuesta");
      }
      return response.data;
    } catch (error) {
      console.error("Error en loginBusiness:", error);
      throw error.response?.data || error.message;
    }
  },

  // Login genérico (detecta el tipo de usuario y usa la ruta correcta)
  login: async (email, password, userType = "client") => {
    if (userType === "business") {
      return authService.loginBusiness(email, password);
    }
    return authService.loginClient(email, password);
  },

  // Sign Up - Cliente (usa /auth/register)
  signUpClient: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      console.log("Respuesta del registro:", response.data);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        // Limpiar el token de comillas si las tiene
        const cleanToken = String(token).replace(/^["']|["']$/g, "");
        console.log(
          "Token guardado (primeros 20 chars):",
          cleanToken.substring(0, 20) + "..."
        );
        localStorage.setItem("token", cleanToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userType", "client");
      } else {
        console.error("No se recibió token en la respuesta");
      }
      return response.data;
    } catch (error) {
      console.error("Error en signUpClient:", error);
      throw error.response?.data || error.message;
    }
  },

  // Sign Up - Negocio (usa /business/register)
  signUpBusiness: async (userData) => {
    try {
      const response = await api.post("/business/register", userData);
      console.log("Respuesta del registro business:", response.data);
      const token = response.data.accessToken || response.data.token;
      if (token) {
        // Limpiar el token de comillas si las tiene
        const cleanToken = String(token).replace(/^["']|["']$/g, "");
        console.log(
          "Token guardado (primeros 20 chars):",
          cleanToken.substring(0, 20) + "..."
        );
        localStorage.setItem("token", cleanToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("userType", "business");
      } else {
        console.error("No se recibió token en la respuesta");
      }
      return response.data;
    } catch (error) {
      console.error("Error en signUpBusiness:", error);
      throw error.response?.data || error.message;
    }
  },

  // Sign Up genérico (detecta el tipo y usa la ruta correcta)
  signUp: async (userData) => {
    if (userData.userType === "business") {
      return authService.signUpBusiness(userData);
    }
    return authService.signUpClient(userData);
  },

  // Refresh Token - Cliente
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

  // Refresh Token - Negocio
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

  // Logout - Cliente
  logoutClient: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      authService.clearStorage();
    }
  },

  // Logout - Negocio
  logoutBusiness: async () => {
    try {
      await api.post("/business/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      authService.clearStorage();
    }
  },

  // Logout genérico
  logout: async () => {
    const userType = localStorage.getItem("userType");
    if (userType === "business") {
      return authService.logoutBusiness();
    }
    return authService.logoutClient();
  },

  // Limpiar storage
  clearStorage: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
  },

  // Get current user
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

  // Get user type
  getUserType: () => {
    const userType = localStorage.getItem("userType");
    if (!userType || userType === "undefined" || userType === "null") {
      return null;
    }
    return userType;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get current user info (desde el backend)
  getMeClient: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current business info (desde el backend)
  getMeBusiness: async () => {
    try {
      const response = await api.get("/business/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get Me genérico
  getMe: async () => {
    const userType = authService.getUserType();
    if (userType === "business") {
      return authService.getMeBusiness();
    }
    return authService.getMeClient();
  },
};

export default authService;
