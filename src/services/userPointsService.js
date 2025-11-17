import api from "./api";

export const userPointsService = {
  // Get user points data for the authenticated user
  getUserPoints: async () => {
    try {
      const response = await api.get("/user-points");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user points by user ID
  getUserPointsById: async (userId) => {
    try {
      const response = await api.get(`/user-points/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get points for a specific business
  getBusinessPoints: async (businessId) => {
    try {
      const response = await api.get(`/user-points/business/${businessId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userPointsService;
