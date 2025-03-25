// src/api/professeur.api.js
import api from './axios';

const professeurApi = {
  // Récupérer tous les professeurs
  getAllProfesseurs: (params = {}) => {
    return api.get('/api/professeurs', { params });
  },

  // Récupérer un professeur par son ID
  getProfesseurById: (id) => {
    return api.get(`/api/professeurs/${id}`);
  },

  // Créer un nouveau professeur
  createProfesseur: (professeurData) => {
    return api.post('/api/professeurs', professeurData);
  },

  // Mettre à jour un professeur
  updateProfesseur: (id, professeurData) => {
    return api.put(`/api/professeurs/${id}`, professeurData);
  },

  // Supprimer un professeur
  deleteProfesseur: (id) => {
    return api.delete(`/api/professeurs/${id}`);
  },

  // Obtenir les matières enseignées par un professeur
  getProfesseurMatieres: (id) => {
    return api.get(`/api/professeurs/${id}/matieres`);
  },

  // Obtenir les classes d'un professeur
  getProfesseurClasses: (id) => {
    return api.get(`/api/professeurs/${id}/classes`);
  }
};

export default professeurApi;
