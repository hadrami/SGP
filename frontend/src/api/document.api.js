// src/api/document.api.js
import api from './axios';

// Configuration spéciale pour les uploads de fichiers
const uploadConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const documentApi = {
  // Récupérer tous les documents
  getAllDocuments: (params = {}) => {
    return api.get('/api/documents', { params });
  },

  // Récupérer un document par son ID
  getDocumentById: (id) => {
    return api.get(`/api/documents/${id}`);
  },

  // Récupérer les documents d'une personne
  getDocumentsByPersonnel: (personnelId) => {
    return api.get(`/api/documents/personnel/${personnelId}`);
  },

  // Uploader un nouveau document
  uploadDocument: (formData) => {
    return api.post('/api/documents', formData, uploadConfig);
  },

  // Mettre à jour les informations d'un document
  updateDocument: (id, documentData) => {
    return api.put(`/api/documents/${id}`, documentData);
  },

  // Supprimer un document
  deleteDocument: (id) => {
    return api.delete(`/api/documents/${id}`);
  },

  // Télécharger un document
  downloadDocument: (id) => {
    return api.get(`/api/documents/${id}/download`, {
      responseType: 'blob' // Important pour les fichiers
    });
  }
};

export default documentApi;
