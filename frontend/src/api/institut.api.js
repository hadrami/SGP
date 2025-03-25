// src/api/institut.api.js
import api from './axios';

const institutApi = {
  // Récupérer tous les instituts
  getAllInstituts: (params = {}) => {
    return api.get('/api/instituts', { params });
  },

  // Récupérer un institut par son ID
  getInstitutById: (id) => {
    return api.get(`/api/instituts/${id}`);
  },

  // Créer un nouvel institut
  createInstitut: (institutData) => {
    return api.post('/api/instituts', institutData);
  },

  // Mettre à jour un institut
  updateInstitut: (id, institutData) => {
    return api.put(`/api/instituts/${id}`, institutData);
  },

  // Supprimer un institut
  deleteInstitut: (id) => {
    return api.delete(`/api/instituts/${id}`);
  },

  // Obtenir tous les militaires d'un institut
  getInstitutMilitaires: (id, params = {}) => {
    return api.get(`/api/instituts/${id}/militaires`, { params });
  },

  // Obtenir tous les civils d'un institut
  getInstitutCivils: (id, params = {}) => {
    return api.get(`/api/instituts/${id}/civils`, { params });
  },

  // Obtenir des statistiques sur un institut
  getInstitutStats: (id) => {
    return api.get(`/api/instituts/${id}/stats`);
  }
};

export default institutApi;
