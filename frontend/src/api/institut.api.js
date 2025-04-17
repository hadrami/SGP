// src/api/institut.api.js
import api from './axios';

const institutApi = {
  /**
   * Récupère tous les instituts
   * @param {Object} params - Paramètres de requête (page, limit, etc.)
   * @returns {Promise} Promesse résolue avec les instituts
   */
  async getAllInstituts(params = {}) {
    const response = await api.get('/api/unites', { params });
    return response.data;
  },

  /**
   * Récupère un institut par son ID
   * @param {string} id - L'ID de l'institut
   * @returns {Promise} Promesse résolue avec l'institut
   */
  async getInstitutById(id) {
    const response = await api.get(`/api/unites/${id}`);
    return response.data;
  },

  /**
   * Crée un nouvel institut
   * @param {Object} institutData - Les données de l'institut à créer
   * @returns {Promise} Promesse résolue avec l'institut créé
   */
  async createInstitut(institutData) {
    // Properly format data for the new API structure
    const uniteData = {
      nom: institutData.nom,
      code: institutData.code,
      description: institutData.description,
      type: 'INSTITUT', // This is important - specify we're creating an institut type
      directeurId: institutData.directeurId,
      institut: {
        emplacement: institutData.emplacement,
        anneeEtude: institutData.anneeEtude,
        specialite: institutData.specialite
      }
    };
    
    const response = await api.post('/api/unites', uniteData);
    return response.data;
  },

  /**
   * Met à jour un institut existant
   * @param {string} id - L'ID de l'institut à mettre à jour
   * @param {Object} institutData - Les nouvelles données de l'institut
   * @returns {Promise} Promesse résolue avec l'institut mis à jour
   */
  async updateInstitut(id, institutData) {
    // Format data for update
    const updateData = {
      nom: institutData.nom,
      description: institutData.description,
      directeurId: institutData.directeurId,
      
      // Include institut-specific fields
      emplacement: institutData.emplacement,
      anneeEtude: institutData.anneeEtude,
      specialite: institutData.specialite
    };
    
    const response = await api.put(`/api/unites/${id}`, updateData);
    return response.data;
  },

  /**
   * Supprime un institut
   * @param {string} id - L'ID de l'institut à supprimer
   * @returns {Promise} Promesse résolue après la suppression
   */
  async deleteInstitut(id) {
    await api.delete(`/api/unites/${id}`);
    return id;
  },

  /**
   * Récupère les militaires d'un institut
   * @param {string} id - L'ID de l'institut
   * @param {Object} params - Paramètres de requête (page, limit, etc.)
   * @returns {Promise} Promesse résolue avec les militaires de l'institut
   */
  async getInstitutMilitaires(id, params = {}) {
    // Adjust to use militaires API with uniteId filter
    const queryParams = {
      ...params,
      uniteId: id
    };
    const response = await api.get('/api/militaires', { params: queryParams });
    return response.data;
  },

  /**
   * Récupère les statistiques d'un institut
   * @param {string} id - L'ID de l'institut
   * @returns {Promise} Promesse résolue avec les statistiques de l'institut
   */
  async getInstitutStats(id) {
    const response = await api.get(`/api/unites/${id}/stats`);
    return response.data;
  }
};

export default institutApi;