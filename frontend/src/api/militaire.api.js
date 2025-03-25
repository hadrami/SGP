// src/api/militaire.api.js - Enhanced version with all endpoints from the updated backend
import api from './axios';

const militaireApi = {
  // Récupérer tous les militaires avec pagination et filtres avancés
  getAllMilitaires: async (params = {}) => {
    console.log('Making API request to:', '/api/militaires', 'with params:', params);
    
    try {
      // Get the token directly for this request
      const token = localStorage.getItem('token');
      
      // Create headers with the token
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Added token to request headers');
      } else {
        console.warn('No token available for militaires request');
      }
      
      // Make the request with explicit headers
      const response = await api.get('/api/militaires', { 
        params,
        headers
      });
      
      return response.data;
    } catch (error) {
      console.error('API error in getAllMilitaires:', error);
      throw error;
    }
  },

  // Récupérer un militaire par son ID
  getMilitaireById: async (id) => {
    console.log(`Fetching militaire with ID: ${id}`);
    try {
      const response = await api.get(`/api/militaires/${id}`);
      console.log('Militaire details response:', response);
      
      // Properly handle the response format
      if (response.data && response.status === 200) {
        // Return the data itself, not the whole response
        return response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error(`Error fetching militaire ${id}:`, error);
      throw error;
    }
  },

  // Récupérer un militaire par son matricule
  getMilitaireByMatricule: async (matricule) => {
    console.log(`Fetching militaire with matricule: ${matricule}`);
    try {
      const response = await api.get(`/api/militaires/matricule/${matricule}`);
      console.log('Militaire details response:', response);
      
      // Properly handle the response format
      if (response.data && response.status === 200) {
        // Return the data itself, not the whole response
        return response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error(`Error fetching militaire with matricule ${matricule}:`, error);
      throw error;
    }
  },

  // Créer un nouveau militaire avec toutes les données
  createMilitaire: async (militaireData) => {
    console.log('Creating militaire with data:', militaireData);
    try {
      const response = await api.post('/api/militaires', militaireData);
      console.log('Create response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating militaire:', error);
      throw error;
    }
  },

  // Mettre à jour un militaire avec toutes les données
  updateMilitaire: async (id, militaireData) => {
    console.log(`Updating militaire with ID: ${id}`);
    console.log('Update data:', militaireData);
    try {
      const response = await api.put(`/api/militaires/${id}`, militaireData);
      console.log('Update response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error updating militaire ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un militaire
  deleteMilitaire: async (id) => {
    console.log(`Deleting militaire with ID: ${id}`);
    try {
      const response = await api.delete(`/api/militaires/${id}`);
      console.log('Delete response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error deleting militaire ${id}:`, error);
      throw error;
    }
  },

  // Obtenir des statistiques sur les militaires
  getMilitaireStats: async () => {
    console.log('Fetching militaire statistics');
    try {
      const response = await api.get('/api/militaires/stats/overview');
      console.log('Stats response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching militaire stats:', error);
      throw error;
    }
  },

  // Mettre à jour la situation d'un militaire
  updateMilitaireSituation: async (id, situationData) => {
    console.log(`Updating situation for militaire with ID: ${id}`);
    console.log('Situation data:', situationData);
    try {
      const response = await api.put(`/api/militaires/${id}/situation`, situationData);
      console.log('Situation update response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error updating situation for militaire ${id}:`, error);
      throw error;
    }
  },

  // Récupérer l'historique des situations d'un militaire
  getMilitaireSituationHistory: async (id) => {
    console.log(`Fetching situation history for militaire with ID: ${id}`);
    try {
      const response = await api.get(`/api/militaires/${id}/situations-historique`);
      console.log('Situation history response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching situation history for militaire ${id}:`, error);
      throw error;
    }
  },

  // Ajouter une décoration à un militaire
  addDecoration: async (militaireId, decorationData) => {
    console.log(`Adding decoration to militaire with ID: ${militaireId}`);
    console.log('Decoration data:', decorationData);
    try {
      const response = await api.post(`/api/militaires/${militaireId}/decorations`, decorationData);
      console.log('Add decoration response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error adding decoration to militaire ${militaireId}:`, error);
      throw error;
    }
  },

  // Ajouter une notation à un militaire
  addNotation: async (militaireId, notationData) => {
    console.log(`Adding notation to militaire with ID: ${militaireId}`);
    console.log('Notation data:', notationData);
    try {
      const response = await api.post(`/api/militaires/${militaireId}/notations`, notationData);
      console.log('Add notation response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error adding notation to militaire ${militaireId}:`, error);
      throw error;
    }
  },

  // Ajouter un stage militaire à un militaire
  addStageMilitaire: async (militaireId, stageData) => {
    console.log(`Adding stage to militaire with ID: ${militaireId}`);
    console.log('Stage data:', stageData);
    try {
      const response = await api.post(`/api/militaires/${militaireId}/stages-militaires`, stageData);
      console.log('Add stage response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error adding stage to militaire ${militaireId}:`, error);
      throw error;
    }
  },
  
  // Récupérer les armes (branches militaires)
  getArmes: async () => {
    console.log('Fetching armes (military branches)');
    try {
      const response = await api.get('/api/armes');
      console.log('Armes response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching armes:', error);
      throw error;
    }
  },
  
  // Récupérer les spécialités d'une arme
  getSpecialitesByArme: async (armeId) => {
    console.log(`Fetching specialites for arme with ID: ${armeId}`);
    try {
      const response = await api.get(`/api/armes/${armeId}/specialites`);
      console.log('Specialites response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching specialites for arme ${armeId}:`, error);
      throw error;
    }
  },
  
  // Récupérer les fonctions disponibles
  getFonctions: async () => {
    console.log('Fetching fonctions');
    try {
      const response = await api.get('/api/fonctions');
      console.log('Fonctions response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching fonctions:', error);
      throw error;
    }
  },
  
  // Récupérer les sous-unités
  getSousUnites: async (uniteId = null) => {
    console.log('Fetching sous-unites' + (uniteId ? ` for unite ${uniteId}` : ''));
    try {
      const url = uniteId 
        ? `/api/unites/${uniteId}/sous-unites` 
        : '/api/sous-unites';
      
      const response = await api.get(url);
      console.log('Sous-unites response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching sous-unites:', error);
      throw error;
    }
  }
};

export default militaireApi;