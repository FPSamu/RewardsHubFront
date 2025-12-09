import axios from "axios";

// Usa la variable de entorno VITE_API_URL o localhost por defecto
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Permite el envío de cookies y credenciales
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Limpiar el token de comillas si las tiene
      const cleanToken = token.replace(/^["']|["']$/g, "");
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log("Token siendo enviado:", cleanToken.substring(0, 20) + "..."); // TODO REMOVE
    } else {
      console.warn("No se encontró token en localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Error 401: Token inválido o expirado");
      // Limpiar localStorage y redirigir al login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
