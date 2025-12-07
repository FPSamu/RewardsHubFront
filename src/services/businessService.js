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

  // Update business location
  updateBusinessLocation: async (address) => {
    try {
      const response = await api.put("/business/location", { address });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update business coordinates
  updateCoordinates: async ({ latitude, longitude }) => {
    try {
      const response = await api.put("/business/coordinates", {
        latitude,
        longitude,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update business information
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
};

export default businessService;
