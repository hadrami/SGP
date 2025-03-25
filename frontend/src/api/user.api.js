// src/api/user.api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Configure Axios with interceptors
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for adding JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If API returns a 401 error, log out the user
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const userApi = {
  getUsers: (params = {}) => {
    return apiClient.get("/api/users", { params });
  },

  getUserById: (id) => {
    return apiClient.get(`/api/users/${id}`);
  },

  createUser: (userData) => {
    return apiClient.post("/api/users", userData);
  },

  updateUser: (id, userData) => {
    return apiClient.put(`/api/users/${id}`, userData);
  },

  deleteUser: (id) => {
    return apiClient.delete(`/api/users/${id}`);
  },

  changePassword: (id, passwordData) => {
    return apiClient.post(`/api/users/${id}/password`, passwordData);
  },
};

export default userApi;