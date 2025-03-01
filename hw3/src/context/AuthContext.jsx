// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { checkAuth, login, logout } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const userData = await login(credentials);
      setUser(userData.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error(error); // Now the error is used
      setIsAuthenticated(false);
      return false;
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login: handleLogin,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};