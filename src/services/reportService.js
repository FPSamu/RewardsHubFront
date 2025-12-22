import api from "./api";

export const reportService = {
  // Generar reporte de transacciones por turno
  generateShiftReport: async (shiftId, date) => {
    try {
      const response = await api.post("/business/reports/generate", {
        shiftId,
        startDate: date,
        endDate: date
      }, {
        responseType: 'blob' // Para recibir el PDF
      });
      return response.data;
    } catch (error) {
      console.error('Error generating shift report:', error);
      
      // Si el error es un blob, intentar leerlo como JSON
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || errorData.error || text);
        } catch (parseError) {
          throw new Error('Error al generar el reporte');
        }
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Error al generar el reporte');
    }
  },

  // Generar reporte de transacciones por día
  generateDayReport: async (date) => {
    try {
      const response = await api.post("/business/reports/generate", {
        startDate: date,
        endDate: date
      }, {
        responseType: 'blob' // Para recibir el PDF
      });
      return response.data;
    } catch (error) {
      console.error('Error generating day report:', error);
      
      // Si el error es un blob, intentar leerlo como JSON
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || errorData.error || text);
        } catch (parseError) {
          throw new Error('Error al generar el reporte');
        }
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Error al generar el reporte');
    }
  },

  // Generar reporte de transacciones por rango de fechas
  generateRangeReport: async (startDate, endDate) => {
    try {
      const response = await api.post("/business/reports/generate", {
        startDate,
        endDate
      }, {
        responseType: 'blob' // Para recibir el PDF
      });
      return response.data;
    } catch (error) {
      console.error('Error generating range report:', error);
      
      // Si el error es un blob, intentar leerlo como JSON
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || errorData.error || text);
        } catch (parseError) {
          throw new Error('Error al generar el reporte');
        }
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Error al generar el reporte');
    }
  },
};

export default reportService;
