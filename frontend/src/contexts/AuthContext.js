import axios from 'axios';
axios.defaults.withCredentials = true;
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const response = await axios.get(`${apiBaseUrl}/api/auth/me`);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const response = await axios.post(`${apiBaseUrl}/api/auth/login`, { email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const response = await axios.post(`${apiBaseUrl}/api/auth/register`, userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  await axios.post(`${apiBaseUrl}/api/auth/logout`);
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logout successful!');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
