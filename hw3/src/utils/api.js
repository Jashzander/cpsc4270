// src/utils/api.js
const API_BASE_URL = 'http://localhost:3000'; // Adjust based on your server setup

// Helper to handle authentication header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API functions for playlists
export const fetchPlaylists = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};

export const createPlaylist = async (playlistData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(playlistData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create playlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

export const updatePlaylist = async (playlistId, playlistData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(playlistData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update playlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating playlist:', error);
    throw error;
  }
};

// API functions for albums and tracks
export const fetchAlbums = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/albums`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch albums');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw error;
  }
};

// Auth functions
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

export const checkAuth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeader()
    });
    
    return response.ok;
  } catch (error) {
    console.error(error);return false;
  }
};