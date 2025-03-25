// src/api/axios.js
import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.8:3000';

// Create a base axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple and reliable request interceptor
// In your axios.js file, modify the request interceptor:
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Debug output - log the exact token being used
    console.log(`Request to ${config.url}`);
    console.log(`Token exists: ${!!token}`);
    if (token) {
      // Show just part of the token for security but enough to verify it's the right one
      console.log(`Using token: ${token.substring(0, 20)}...`);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple and reliable response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch logout to update Redux state
      store.dispatch(logout());
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        console.log('Session expired. Redirecting to login.');
        window.location.href = '/login?expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;