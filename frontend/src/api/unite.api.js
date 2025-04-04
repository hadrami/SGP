// src/api/unite.api.js
import api from './axios';

const uniteApi = {
  // Récupérer toutes les unités
  getAllUnites: (params = {}) => {
    return api.get('/api/unites', { params });
  },

  // Récupérer une unité par son ID
  getUniteById: (id) => {
    return api.get(`/api/unites/${id}`);
  },

  // Créer une nouvelle unité
  createUnite: (uniteData) => {
    return api.post('/api/unites', uniteData);
  },

  // Mettre à jour une unité
  updateUnite: (id, uniteData) => {
    return api.put(`/api/unites/${id}`, uniteData);
  },

  // Supprimer une unité
  deleteUnite: (id) => {
    return api.delete(`/api/unites/${id}`);
  },

  // Récupérer les sous-unités d'une unité
  getUniteSousUnites: (id) => {
    return api.get(`/api/unites/${id}/sous-unites`);
  }
};

export default uniteApi;