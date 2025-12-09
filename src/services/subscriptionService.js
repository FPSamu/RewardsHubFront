import api from "./api";

export const subscriptionService = {
  // Get current business subscription status
  getSubscriptionStatus: async () => {
    try {
      const response = await api.get("/subscription/status");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create Stripe checkout session
  createCheckoutSession: async (priceId, plan) => {
    try {
      const response = await api.post("/subscription/checkout", {
        priceId,
        plan,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get subscription plans
  getPlans: async () => {
    try {
      const response = await api.get("/subscription/plans");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await api.post("/subscription/cancel");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify subscription after payment
  verifySubscription: async () => {
    try {
      const response = await api.get("/subscription/verify");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Activate lifetime subscription (for special users)
  activateLifetime: async (code) => {
    try {
      const response = await api.post("/subscription/activate-lifetime", {
        code,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default subscriptionService;
