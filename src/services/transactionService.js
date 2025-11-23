import api from "./api";

export const transactionService = {
  // Get all transactions for the authenticated user
  getUserTransactions: async (limit = 50, offset = 0) => {
    try {
      const response = await api.get("/transactions", {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction statistics for the authenticated user
  getUserTransactionStats: async () => {
    try {
      const response = await api.get("/transactions/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's transactions at a specific business
  getUserTransactionsAtBusiness: async (businessId, limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/transactions/business/${businessId}`, {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a specific transaction by ID
  getTransactionById: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Business endpoints (for reference, won't be used in ClientPoints)
  getBusinessTransactions: async (limit = 50, offset = 0) => {
    try {
      const response = await api.get("/transactions/business", {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific user's transactions at authenticated business
  getBusinessUserTransactions: async (userId, limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/transactions/business/user/${userId}`, {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default transactionService;
