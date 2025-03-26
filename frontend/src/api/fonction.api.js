// src/api/fonction.api.js
import api from './axios';

const fonctionApi = {
  // Récupérer toutes les fonctions
  getAllFonctions: async () => {
    try {
      const response = await api.get('/api/fonctions');
      return response.data;
    } catch (error) {
      console.error('Error fetching fonctions:', error);
      throw error;
    }
  }
};

export default fonctionApi;