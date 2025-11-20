import api from "./api";

export const rewardService = {
  // Get all rewards for a business
  getBusinessRewards: async (businessId) => {
    try {
      const response = await api.get(`/rewards/business/${businessId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get reward by ID
  getRewardById: async (rewardId) => {
    try {
      const response = await api.get(`/user/${rewardId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get available rewards for user
  getAvailableRewards: async () => {
    try {
      const response = await api.get("/rewards/available");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a points-based reward
  createPointsReward: async (rewardData) => {
    try {
      const response = await api.post("/rewards", rewardData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a stamps-based reward
  createStampsReward: async (rewardData) => {
    try {
      const response = await api.post("/rewards", rewardData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default rewardService;
