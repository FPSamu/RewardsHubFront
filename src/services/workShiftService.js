import api from "./api";

export const workShiftService = {
  // Get all work shifts for the authenticated business
  getMyWorkShifts: async () => {
    try {
      const response = await api.get("/business/work-shifts");
      return response.data;
    } catch (error) {
      console.error('Error in getMyWorkShifts:', error);
      // Si es un error 404, significa que no hay turnos, retornar array vacío
      if (error.response?.status === 404) {
        return [];
      }
      // Para otros errores, lanzar la excepción
      throw error.response?.data || error.message;
    }
  },

  // Get a specific work shift by ID
  getWorkShiftById: async (shiftId) => {
    try {
      const response = await api.get(`/business/work-shifts/${shiftId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new work shift
  createWorkShift: async (shiftData) => {
    try {
      const response = await api.post("/business/work-shifts", shiftData);
      return response.data;
    } catch (error) {
      console.error('Error in createWorkShift:', error);
      // Intentar extraer el mensaje de error más específico
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Error al crear el turno');
    }
  },

  // Update an existing work shift
  updateWorkShift: async (shiftId, shiftData) => {
    try {
      const response = await api.put(`/business/work-shifts/${shiftId}`, shiftData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a work shift
  deleteWorkShift: async (shiftId) => {
    try {
      const response = await api.delete(`/business/work-shifts/${shiftId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default workShiftService;
