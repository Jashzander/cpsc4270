// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    loginWithRedirect, 
    logout: auth0Logout,
    getAccessTokenSilently 
  } = useAuth0();
  
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
          localStorage.setItem('authToken', accessToken);
        } catch (error) {
          console.error('Error getting access token:', error);
        }
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    auth0Logout({ returnTo: window.location.origin });
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login: loginWithRedirect,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};