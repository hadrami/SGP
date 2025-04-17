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

  // Récupérer une unité par son code
  getUniteByCode: (code) => {
    return api.get(`/api/unites/code/${code}`);
  },

  // Récupérer des unités par type
  getUnitesByType: (type) => {
    return api.get(`/api/unites/type/${type}`);
  },

  // Récupérer le personnel d'une unité
  getUnitePersonnel: (uniteId, params = {}) => {
    return api.get(`/api/unites/${uniteId}/personnel`, { params });
  },

  // Récupérer les statistiques d'une unité
  getUniteStats: (uniteId) => {
    return api.get(`/api/unites/${uniteId}/stats`);
  },

  // Récupérer les sous-unités d'une unité
  getUniteSousUnites: (id) => {
    return api.get(`/api/unites/${id}/sous-unites`);
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
  }
};

export default uniteApi;