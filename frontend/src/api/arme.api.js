// src/api/arme.api.js
import api from './axios';

const armeApi = {
  // Récupérer toutes les armes
  getAllArmes: async () => {
    try {
      const response = await api.get('/api/armes');
      return response.data;
    } catch (error) {
      console.error('Error fetching armes:', error);
      throw error;
    }
  },

  // Récupérer les spécialités d'une arme
  getSpecialitesByArme: async (armeId) => {
    try {
      const response = await api.get(`/api/armes/${armeId}/specialites`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching specialites for arme ${armeId}:`, error);
      throw error;
    }
  }
};

export default armeApi;