import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Fetch user data
      axios.get('http://localhost:8000/api/auth/user/')
        .then(response => {
          setCurrentUser(response.data);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          // If token is invalid, remove it
          localStorage.removeItem('authToken');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Set user state
      setCurrentUser(user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        username,
        email,
        password
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem('authToken');
    
    // Remove axios default headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset user state
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};