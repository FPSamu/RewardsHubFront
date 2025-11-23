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

  // Add points/stamps to a user (business action)
  addPoints: async (data) => {
    try {
      const response = await api.post("/user-points/add", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all users with points at the authenticated business
  getBusinessUsers: async () => {
    try {
      const response = await api.get("/user-points/business-users");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Subtract points/stamps from a user (business action - for redeeming rewards)
  subtractPoints: async (data) => {
    try {
      const response = await api.post("/user-points/subtract", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userPointsService;
