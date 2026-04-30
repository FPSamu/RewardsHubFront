import api from './api';

export const businessDashboardService = {
  getStats: async () => {
    const response = await api.get('/business/stats');
    return response.data;
  },

  getRecentClients: async (limit = 5) => {
    const response = await api.get('/business/recent-clients', { params: { limit } });
    return response.data;
  },
};

export default businessDashboardService;
