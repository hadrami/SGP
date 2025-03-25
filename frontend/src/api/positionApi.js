// src/api/position.api.js
import api from './axios';

const positionApi = {
  getAllPositions: async () => {
    try {
      const response = await api.get('/api/positions');
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  },
  
  getPositionById: async (id) => {
    try {
      const response = await api.get(`/api/positions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching position ${id}:`, error);
      throw error;
    }
  }
};

export default positionApi;