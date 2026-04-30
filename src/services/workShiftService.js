import api from './api';

const parseError = (err) => { throw err?.response?.data || err?.message || err; };

const workShiftService = {
  create: async (data) => {
    try {
      const response = await api.post('/business/work-shifts', data);
      return response.data;
    } catch (error) { parseError(error); }
  },

  getByBranch: async (branchId, includeInactive = false) => {
    try {
      const response = await api.get('/business/work-shifts', {
        params: { branchId, ...(includeInactive && { includeInactive: true }) },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return [];
      parseError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/business/work-shifts/${id}`);
      return response.data;
    } catch (error) { parseError(error); }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/business/work-shifts/${id}`, data);
      return response.data;
    } catch (error) { parseError(error); }
  },

  toggle: async (id) => {
    try {
      const response = await api.patch(`/business/work-shifts/${id}/toggle`);
      return response.data;
    } catch (error) { parseError(error); }
  },

  delete: async (id) => {
    try {
      await api.delete(`/business/work-shifts/${id}`);
    } catch (error) { parseError(error); }
  },
};

export default workShiftService;
