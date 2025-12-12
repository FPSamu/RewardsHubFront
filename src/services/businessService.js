import api from "./api";

export const businessService = {
  // Get all businesses
  getAllBusinesses: async () => {
    try {
      const response = await api.get("/business");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get nearby businesses
  getNearbyBusinesses: async (latitude, longitude, maxDistanceKm = 50) => {
    try {
      const response = await api.get("/business/nearby", {
        params: { latitude, longitude, maxDistanceKm },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get business by ID
  getBusinessById: async (businessId) => {
    try {
      const response = await api.get(`/business/${businessId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get authenticated business info
  getMyBusiness: async () => {
    try {
      const response = await api.get("/business/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Agregar nueva sucursal
  addLocation: async (data) => {
    try {
      const response = await api.post("/business/locations", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Editar sucursal existente
  updateLocation: async (locationId, data) => {
    try {
      const response = await api.put(`/business/locations/${locationId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar sucursal
  deleteLocation: async (locationId) => {
    try {
      const response = await api.delete(`/business/locations/${locationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update business information (Nombre, Categoría, Descripción)
  updateBusinessInfo: async (updates) => {
    try {
      const response = await api.put("/business/me", updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload business logo
  uploadLogo: async (file) => {
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await api.post("/business/logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete business account
  deleteAccount: async () => {
    try {
      const response = await api.delete("/business/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default businessService;