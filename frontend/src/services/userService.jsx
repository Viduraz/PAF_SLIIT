// src/services/userService.js
import api from "./api";

const UserService = {
  register: (userData) => {
    return api.post("/users/register", userData);
  },
  
  login: (credentials) => {
    return api.post("/users/login", credentials);
  },
  
  getCurrentUser: () => {
    return api.get("/users/me");
  },
  
  updateProfile: (userId, userData) => {
    return api.put(`/users/${userId}`, userData);
  },
  
  getUserProfile: (userId) => {
    return api.get(`/users/${userId}`);
  },
  
  getUserByUsername: (username) => {
    return api.get(`/users/username/${username}`);
  },
  
  getUserPosts: (userId) => {
    return api.get(`/users/${userId}/posts`);
  }
};

export default UserService;