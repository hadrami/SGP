// src/api/situation.api.js
import api from './axios';

const situationApi = {
  // Récupérer toutes les situations
  getAllSituations: (params = {}) => {
    return api.get('/api/situations', { params });
  },

  // Récupérer une situation par son ID
  getSituationById: (id) => {
    return api.get(`/api/situations/${id}`);
  },

  // Créer une nouvelle situation
  createSituation: (situationData) => {
    return api.post('/api/situations', situationData);
  },

  // Mettre à jour une situation
  updateSituation: (id, situationData) => {
    return api.put(`/api/situations/${id}`, situationData);
  },

  // Supprimer une situation
  deleteSituation: (id) => {
    return api.delete(`/api/situations/${id}`);
  },

  // Obtenir les situations par date
  getSituationsByDate: (date) => {
    return api.get('/api/situations/date', { params: { date } });
  },

  // Obtenir les situations par institut
  getSituationsByInstitut: (institutId, params = {}) => {
    return api.get(`/api/situations/institut/${institutId}`, { params });
  },

  // Générer un rapport de situation
  generateSituationReport: (params = {}) => {
    return api.get('/api/situations/report', { 
      params,
      responseType: 'blob' // Important pour les fichiers PDF
    });
  }
};

export default situationApi;
