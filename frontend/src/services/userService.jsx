// src/services/userService.js
import api from "./api";

const UserService = {
  register: (userData) => {
    return api.post("/users/register", userData);
  },
  
  login: async (credentials) => {
    try {
      console.log('Login request payload:', credentials);
      const response = await api.post("/users/login", credentials);
      console.log('Login response:', response.data);
      return response;
    } catch (error) {
      console.error('Login service error:', error.response || error);
      throw error;
    }
  },
  
  getCurrentUser: () => {
    return api.get("/users/me");
  },
  
  updateProfile: (userId, userData) => {
    return api.put(`/users/${userId}`, userData);
  },
  
  getUserProfile: (userId) => {
    return api.get(`/users/${userId}`);
  }
};

export default UserService;