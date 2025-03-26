// src/api/sousUnite.api.js
import api from './axios';

const sousUniteApi = {
  // Récupérer toutes les sous-unités
  getAllSousUnites: async () => {
    try {
      const response = await api.get('/api/sous-unites');
      return response.data;
    } catch (error) {
      console.error('Error fetching sous-unites:', error);
      throw error;
    }
  }
};

export default sousUniteApi;