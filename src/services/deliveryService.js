import api from "./api";
import idempotentPost from "./idempotentPost";
import { getDeviceTimezone } from "../utils/timezone";

const deliveryService = {
  generateCode: async (payload) => {
    try {
      const response = await api.post("/delivery/generate", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  claimCode: async (code, idempotencyKey) => {
    try {
      const response = await idempotentPost("/delivery/claim", {
        code,
        timezone: getDeviceTimezone(),
      }, idempotencyKey);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default deliveryService;
