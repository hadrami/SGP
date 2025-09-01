// src/api/personnel.api.js
import api from './axios';

const personnelApi = {
  // Récupérer tous les personnels (tous types confondus)
  getAllPersonnels: (params = {}) => {
    return api.get('/api/personnels', { params });
  },

  // Récupérer un personnel par son ID
  getPersonnelById: (id) => {
    return api.get(`/api/personnels/${id}`);
  },

  // Récupérer un personnel par son NNI
  getPersonnelByNni: (nni) => {
    return api.get(`/api/personnels/nni/${nni}`);
  },

  // Récupérer les personnels par type (MILITAIRE, CIVIL_PROFESSEUR, CIVIL_ETUDIANT, CIVIL_EMPLOYE)
  getPersonnelsByType: (type, params = {}) => {
    return api.get(`/api/personnels/type/${type}`, { params });
  },

  // Récupérer les personnels par institut
  getPersonnelsByInstitut: (institutId, params = {}) => {
    return api.get(`/api/personnels/institut/${institutId}`, { params });
  },

  // Créer un nouveau personnel (données communes)
  createPersonnel: (personnelData) => {
    return api.post('/api/personnels', personnelData);
  },

  // Mettre à jour un personnel (données communes)
  updatePersonnel: (id, personnelData) => {
    return api.put(`/api/personnels/${id}`, personnelData);
  },
   // ③ Upload/replace image
   uploadImage: (id, formData) =>
    api.patch(`/api/personnels/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Supprimer un personnel
  deletePersonnel: (id) => {
    return api.delete(`/api/personnels/${id}`);
  },

  // Récupérer les documents d'un personnel
  getPersonnelDocuments: (id) => {
    return api.get(`/api/personnels/${id}/documents`);
  },

  // Ajouter un document à un personnel
  addPersonnelDocument: (id, formData) => {
    return api.post(`/api/personnels/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Supprimer un document d'un personnel
  deletePersonnelDocument: (personnelId, documentId) => {
    return api.delete(`/api/personnels/${personnelId}/documents/${documentId}`);
  },

  // Recherche avancée des personnels
  searchPersonnels: (searchCriteria) => {
    return api.post('/api/personnels/search', searchCriteria);
  },

  // Obtenir des statistiques sur les personnels
  getPersonnelStats: (params = {}) => {
    return api.get('/api/personnels/stats', { params });
  },

  // Générer un rapport sur les personnels (PDF)
  generatePersonnelReport: (params = {}) => {
    return api.get('/api/personnels/report', { 
      params,
      responseType: 'blob' // Important pour les fichiers PDF
    });
  },

  // Importer des personnels depuis un fichier Excel
  importPersonnels: (formData) => {
    return api.post('/api/personnels/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Exporter les personnels en Excel
  exportPersonnels: (params = {}) => {
    return api.get('/api/personnels/export', { 
      params,
      responseType: 'blob' // Important pour les fichiers Excel
    });
  },

  // Obtenir la situation d'un personnel
  getPersonnelSituation: (id, date = null) => {
    return api.get(`/api/personnels/${id}/situation`, {
      params: date ? { date } : {}
    });
  },

  // Mettre à jour la situation d'un personnel
  updatePersonnelSituation: (id, situationData) => {
    return api.put(`/api/personnels/${id}/situation`, situationData);
  },

  // Obtenir l'historique des situations d'un personnel
  getPersonnelSituationHistory: (id, params = {}) => {
    return api.get(`/api/personnels/${id}/situations`, { params });
  }
};

export default personnelApi;
