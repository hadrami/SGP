// src/api/etudiant.api.js
import api from './axios';

const etudiantApi = {
  // Récupérer tous les étudiants
  getAllEtudiants: (params = {}) => {
    return api.get('/api/etudiants', { params });
  },

  // Récupérer un étudiant par son ID
  getEtudiantById: (id) => {
    return api.get(`/api/etudiants/${id}`);
  },

  // Récupérer un étudiant par son matricule
  getEtudiantByMatricule: (matricule) => {
    return api.get(`/api/etudiants/matricule/${matricule}`);
  },

  // Créer un nouvel étudiant
  createEtudiant: (etudiantData) => {
    return api.post('/api/etudiants', etudiantData);
  },

  // Mettre à jour un étudiant
  updateEtudiant: (id, etudiantData) => {
    return api.put(`/api/etudiants/${id}`, etudiantData);
  },

  // Supprimer un étudiant
  deleteEtudiant: (id) => {
    return api.delete(`/api/etudiants/${id}`);
  },

  // Obtenir les relevés de notes d'un étudiant
  getEtudiantReleveNotes: (id) => {
    return api.get(`/api/etudiants/${id}/releves-notes`);
  },

  // Obtenir les stages d'un étudiant
  getEtudiantStages: (id) => {
    return api.get(`/api/etudiants/${id}/stages`);
  },

  // Mettre à jour le statut d'un étudiant
  updateEtudiantStatut: (id, statut) => {
    return api.put(`/api/etudiants/${id}/statut`, { statut });
  }
};

export default etudiantApi;
