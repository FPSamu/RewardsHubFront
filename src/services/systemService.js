import api from "./api";

export const systemService = {
  // Get all systems for authenticated business
  getBusinessSystems: async () => {
    try {
      const response = await api.get("/systems");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get system by ID
  getSystemById: async (systemId) => {
    try {
      const response = await api.get(`/systems/${systemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a points-based system
  createPointsSystem: async (systemData) => {
    try {
      const response = await api.post("/systems/points", systemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a stamps-based system
  createStampsSystem: async (systemData) => {
    try {
      const response = await api.post("/systems/stamps", systemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a points-based system
  updatePointsSystem: async (systemId, systemData) => {
    try {
      const response = await api.put(`/systems/points/${systemId}`, systemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a stamps-based system
  updateStampsSystem: async (systemId, systemData) => {
    try {
      const response = await api.put(`/systems/stamps/${systemId}`, systemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a system
  deleteSystem: async (systemId, hardDelete = false) => {
    try {
      const response = await api.delete(`/systems/${systemId}`, {
        params: { hardDelete },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default systemService;
