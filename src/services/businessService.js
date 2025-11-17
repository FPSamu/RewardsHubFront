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
};

export default businessService;
