import api from "./api";

const deliveryService = {
  generateCode: async (payload) => {
    try {
      const response = await api.post("/delivery/generate", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  claimCode: async (code) => {
    try {
      const response = await api.post("/delivery/claim", { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default deliveryService;
