// src/utils/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import UserService from '../services/userService';
import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from './firebase.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios to always include the token in requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

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
          
          // Set the user from localStorage
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          
          // Set the token in axios defaults
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Don't validate token with backend since it's returning HTML
          // Just keep user logged in based on localStorage
          console.log('Keeping user logged in from localStorage');
        }
      } catch (error) {
        console.error("Error restoring authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = (userData) => {
    setCurrentUser(userData.user || userData);
    localStorage.setItem(
      "currentUser",
      JSON.stringify(userData.user || userData)
    );
    if (userData.token) {
      const token = userData.token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  // Add the missing updateCurrentUser function
  const updateCurrentUser = (updatedUserData) => {
    // Update the currentUser state
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
    
    // Update the user data in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const updatedUser = {
        ...parsedUser,
        ...updatedUserData
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Send the Google user info to your backend for validation/registration
      const response = await UserService.loginWithGoogle({
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid
      });
      
      // Login with the response from your backend
      login(response.data);
      return response;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        loading,
        updateCurrentUser,
        loginWithGoogle,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;