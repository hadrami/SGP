// src/api/auth.api.js
import api from './axios';


const authApi = {
  login: async (identifier, password) => {
    const response = await api.post('/api/auth/login', { identifier, password });
    return response.data;
  },
  
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token in localStorage during verifyToken call');
        throw new Error('No token found');
      }
      
      const response = await api.get('/api/auth/verify-token');
      return response.data;
    } catch (error) {
      console.error('Token verification API error:', error);
      throw error;
    }
  },
  
  changePassword: async (passwordData) => {
    const response = await api.post('/api/auth/change-password', passwordData);
    return response.data;
  }
};

export default authApi;