// src/utils/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import UserService from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Restoring authentication state...');
    // Restore authentication state on page load
    const restoreAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');
        console.log('Stored token:', token);
        console.log('Stored user:', storedUser);

        if (token && storedUser) {
          console.log('Token and user found in localStorage');
          // Temporarily set the user from localStorage to avoid flickering
          setCurrentUser(JSON.parse(storedUser));

          // Validate the token with the backend
          try {
            const response = await UserService.getCurrentUser();
            console.log('Token validation response:', response);
            setCurrentUser(response.data); // Update with fresh data from the backend
            console.log('Token is valid, user data:', response.data);
          } catch (error) {
            console.log('Token validation failed:', error);
            console.error('Token validation failed:', error);
            // If token validation fails, clear the user state
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Error restoring authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = (userData) => {
    setCurrentUser(userData.user || userData);
    localStorage.setItem('currentUser', JSON.stringify(userData.user || userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);