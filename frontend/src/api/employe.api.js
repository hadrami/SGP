// src/api/employe.api.js
import api from './axios';

const employeApi = {
  // Récupérer tous les employés
  getAllEmployes: (params = {}) => {
    return api.get('/api/employes', { params });
  },

  // Récupérer un employé par son ID
  getEmployeById: (id) => {
    return api.get(`/api/employes/${id}`);
  },

  // Créer un nouvel employé
  createEmploye: (employeData) => {
    return api.post('/api/employes', employeData);
  },

  // Mettre à jour un employé
  updateEmploye: (id, employeData) => {
    return api.put(`/api/employes/${id}`, employeData);
  },

  // Supprimer un employé
  deleteEmploye: (id) => {
    return api.delete(`/api/employes/${id}`);
  },

  // Mettre à jour la situation d'un employé
  updateEmployeSituation: (id, situation) => {
    return api.put(`/api/employes/${id}/situation`, { situation });
  }
};

export default employeApi;
