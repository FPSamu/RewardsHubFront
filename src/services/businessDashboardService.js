import api from './api';

export const businessDashboardService = {
  getStats: async () => {
    const response = await api.get('/business/stats');
    return response.data;
  },

  getRecentClients: async (limit = 5) => {
    const response = await api.get('/transactions/business', { params: { limit } });
    const data = response.data;
    const txs = Array.isArray(data) ? data
              : Array.isArray(data?.transactions) ? data.transactions
              : [];

    const uniqueUserIds = [...new Set(txs.map((t) => t.userId).filter(Boolean))];
    const usernameMap = {};
    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const user = await api.get(`/auth/${userId}`);
          usernameMap[userId] = user.data?.username ?? 'Usuario';
        } catch {
          usernameMap[userId] = 'Usuario';
        }
      })
    );

    return txs.map((tx) => ({
      ...tx,
      username: usernameMap[tx.userId] ?? 'Usuario',
    }));
  },
};

export default businessDashboardService;
