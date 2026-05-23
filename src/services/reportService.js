import api from './api';
import { getDeviceTimezone } from '../utils/timezone';

const parseBlobError = async (error) => {
  if (error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const data = JSON.parse(text);
      throw new Error(data.message || data.error || text);
    } catch {
      throw new Error('Error al generar el reporte');
    }
  }
  throw new Error(
    error.response?.data?.message ||
    error.response?.data?.error  ||
    error.message                ||
    'Error al generar el reporte'
  );
};

const buildBody = ({ startDate, endDate, shiftIds, types }) => ({
  startDate,
  endDate,
  timezone: getDeviceTimezone(),
  ...(shiftIds?.length && { shiftIds }),
  ...(types?.length    && { types }),
});

const reportService = {
  /**
   * Genera y descarga el PDF del reporte.
   * Devuelve un Blob (application/pdf).
   */
  generate: async ({ startDate, endDate, shiftIds, types } = {}) => {
    try {
      const response = await api.post(
        '/report/generate',
        buildBody({ startDate, endDate, shiftIds, types }),
        { responseType: 'blob' },
      );
      return response.data;
    } catch (error) {
      await parseBlobError(error);
    }
  },

  /**
   * Vista previa del reporte en JSON antes de descargar el PDF.
   * Mismos parámetros que generate.
   */
  preview: async ({ startDate, endDate, shiftIds, types } = {}) => {
    try {
      const response = await api.post(
        '/report/preview',
        buildBody({ startDate, endDate, shiftIds, types }),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error  ||
        error.message                ||
        'Error al obtener vista previa'
      );
    }
  },
};

export default reportService;
