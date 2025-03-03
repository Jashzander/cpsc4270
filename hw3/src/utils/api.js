// src/utils/api.js
// Use the API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper to handle authentication header with Auth0
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  
  // In production, we should not use mock tokens
  if (import.meta.env.MODE === 'production' && !token) {
    console.error('No auth token found in production mode');
    return {};
  }
  
  // For development purposes only, if no token exists, create a mock one
  if (!token && import.meta.env.MODE === 'development') {
    console.warn('No auth token found, using mock token for development');
    return { Authorization: 'Bearer mock_token_for_development' };
  }
  
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Common fetch function with improved error handling
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...getAuthHeader(),
  };
  
  // Add retry logic for network issues
  let retries = 2;
  let response;
  
  while (retries >= 0) {
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for cross-origin requests
      });
      break; // If successful, exit the retry loop
    } catch (error) {
      if (retries === 0) throw error;
      console.log(`Network error, retrying... (${retries} attempts left)`);
      retries--;
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Handle 304 Not Modified as success
  if (response.status === 304) {
    console.log(`304 Not Modified received for ${url} - using cached data`);
    // Try to get cached data from localStorage
    const cacheKey = `cache_${url.replace(API_BASE_URL, '')}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    // If no cached data, treat as empty array
    return [];
  }
  
  // Special handling for 401 Unauthorized or 403 Forbidden (authentication issues)
  if (response.status === 401 || response.status === 403) {
    console.error(`Authentication error: ${response.status}`);
    
    // Redirect to login if unauthorized
    if (response.status === 401) {
      // Clear token as it might be expired
      localStorage.removeItem('authToken');
      
      // Redirect to Auth0 login page
      window.location.href = '/login';
      return;
    }
    
    // For development purposes, try to use cached data if available
    const cacheKey = `cache_${url.replace(API_BASE_URL, '')}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      console.warn('Using cached data due to authentication error');
      return JSON.parse(cachedData);
    }
    
    // If this is a playlist operation, try to use optimistic updates
    if (url.includes('/playlists') && (options.method === 'PUT' || options.method === 'POST') && options.body) {
      console.warn('Authentication error on playlist operation, using optimistic update');
      try {
        // Parse the request body to use as fallback data
        const requestData = JSON.parse(options.body);
        
        // Extract playlist ID from URL for PUT requests
        if (!requestData.id && !requestData._id && url.includes('/playlists/')) {
          const urlParts = url.split('/');
          const playlistId = urlParts[urlParts.length - 1];
          
          // Ensure the ID is included in the response
          requestData._id = playlistId;
          requestData.id = playlistId;
          console.log('Added ID to optimistic update data:', requestData);
        }
        
        return requestData;
      } catch (parseError) {
        console.error('Failed to parse request data for optimistic update:', parseError);
      }
    }
  }
  
  // Special handling for 500 errors on playlist operations
  if (response.status === 500 && url.includes('/playlists') && (options.method === 'PUT' || options.method === 'POST')) {
    const errorText = await response.text();
    console.error('Server error on playlist operation:', errorText);
    
    // Check if it's a connection error (EAGAIN)
    const isConnectionError = errorText.includes('EAGAIN') || errorText.includes('connect');
    
    if (isConnectionError) {
      console.warn('Server connection error detected, using optimistic update');
    } else {
      console.warn('Server error on playlist update, using optimistic update');
    }
    
    // For playlist updates, try to use optimistic updates
    if (options.method === 'PUT' && options.body) {
      try {
        // Parse the request body to use as fallback data
        const requestData = JSON.parse(options.body);
        
        // Extract playlist ID from URL for PUT requests
        if (!requestData.id && !requestData._id) {
          const urlParts = url.split('/');
          const playlistId = urlParts[urlParts.length - 1];
          
          // Ensure the ID is included in the response
          requestData._id = playlistId;
          requestData.id = playlistId;
          console.log('Added ID to optimistic update data:', requestData);
        }
        
        // Store in cache to ensure data consistency
        const cacheKey = `cache_${url.replace(API_BASE_URL, '')}`;
        localStorage.setItem(cacheKey, JSON.stringify(requestData));
        
        // Also store as a playlist backup
        if (requestData.id) {
          localStorage.setItem(`playlist_backup_${requestData.id}`, JSON.stringify(requestData));
        }
        
        return requestData;
      } catch (parseError) {
        console.error('Failed to parse request data for optimistic update:', parseError);
      }
    }
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server response:', errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  let data;
  try {
    const text = await response.text();
    console.log('Raw response text:', text);
    
    // Check if the response is empty or not valid JSON
    if (!text || text.trim() === '' || text.startsWith('/')) {
      console.warn('Empty or invalid response received');
      data = response.url.includes('/playlists') ? [] : {};
    } else {
      try {
        data = JSON.parse(text);
        console.log('Response parsed successfully:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Return empty object or array as fallback
        data = response.url.includes('/playlists') ? [] : {};
      }
    }
  } catch (responseError) {
    console.error('Error reading response:', responseError);
    // Return empty object or array as fallback
    data = response.url.includes('/playlists') ? [] : {};
  }
  
  // Cache the successful response
  const cacheKey = `cache_${url.replace(API_BASE_URL, '')}`;
  localStorage.setItem(cacheKey, JSON.stringify(data));
  
  return data;
};

// API functions for playlists
export const fetchPlaylists = async () => {
  try {
    console.log('Fetching playlists...');
    const data = await fetchWithAuth(`${API_BASE_URL}/playlists`);
    console.log('Playlists fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};

export const createPlaylist = async (playlistData) => {
  try {
    console.log('Creating playlist:', playlistData);
    
    // Validate playlist data
    if (!playlistData || !playlistData.name) {
      throw new Error('Invalid playlist data: name is required');
    }
    
    // Ensure tracks is an array
    const validatedData = {
      ...playlistData,
      name: playlistData.name.trim(),
      tracks: Array.isArray(playlistData.tracks) ? playlistData.tracks : []
    };
    
    // Send the request
    const response = await fetchWithAuth(`${API_BASE_URL}/playlists`, {
      method: 'POST',
      body: JSON.stringify(validatedData)
    });
    
    // The backend returns a URL to the new playlist, extract the ID
    let data = response;
    if (typeof response === 'string') {
      // Extract ID from URL
      const parts = response.split('/');
      const id = parts[parts.length - 1];
      
      // Create a data object with the ID
      data = {
        ...validatedData,
        id,
        _id: id
      };
      
      console.log('Playlist created successfully, extracted ID:', data);
    } else if (!data.id && !data._id) {
      console.warn('Response missing ID, adding fallback ID');
      data.id = Date.now().toString(); // Fallback ID
      data._id = data.id;
    }
    
    console.log('Playlist created successfully:', data);
    
    // Clear the cache for playlists to force a refresh
    localStorage.removeItem('cache_/playlists');
    
    return data;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

// Add a function to delete a playlist
export const deletePlaylist = async (playlistId) => {
  try {
    if (!playlistId) {
      throw new Error('Invalid playlist ID for deletion');
    }
    
    console.log('Deleting playlist:', playlistId);
    
    await fetchWithAuth(`${API_BASE_URL}/playlists/${playlistId}`, {
      method: 'DELETE'
    });
    
    console.log('Playlist deleted successfully');
    
    // Clear the cache for playlists
    localStorage.removeItem('cache_/playlists');
    
    return true;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
};

export const updatePlaylist = async (playlistId, playlistData) => {
  let normalizedData = { ...playlistData };
  
  try {
    if (!playlistId) {
      throw new Error('Invalid playlist ID for update');
    }
    
    console.log('Updating playlist:', playlistId, playlistData);
    
    // Ensure the playlist data has consistent ID fields
    if (!normalizedData.id) normalizedData.id = playlistId;
    if (!normalizedData._id) normalizedData._id = playlistId;
    
    // Save a backup in localStorage before attempting server update
    const backupKey = `playlist_backup_${playlistId}`;
    localStorage.setItem(backupKey, JSON.stringify(normalizedData));
    
    // Update the playlist's privacy status
    console.log('Updating playlist privacy status...');
    await fetchWithAuth(`${API_BASE_URL}/playlists/${playlistId}/isPublic`, {
      method: 'PUT',
      body: JSON.stringify(normalizedData.isPublic)
    });
    
    // Then, handle track updates individually
    console.log('Updating playlist tracks...');
    
    // Get the current tracks from the server
    const currentPlaylist = await fetchWithAuth(`${API_BASE_URL}/playlists/${playlistId}`);
    const currentTracks = currentPlaylist.tracks || [];
    
    // Convert tracks to IDs if they are objects
    const newTrackIds = normalizedData.tracks.map(track => 
      typeof track === 'object' ? track.id : track
    );
    
    // Find tracks to add (in new list but not in current list)
    const tracksToAdd = newTrackIds.filter(trackId => 
      !currentTracks.includes(trackId)
    );
    
    // Find tracks to remove (in current list but not in new list)
    const tracksToRemove = currentTracks.filter(trackId => 
      !newTrackIds.includes(trackId)
    );
    
    console.log('Tracks to add:', tracksToAdd);
    console.log('Tracks to remove:', tracksToRemove);
    
    // Add new tracks
    for (const trackId of tracksToAdd) {
      console.log(`Adding track ${trackId} to playlist ${playlistId}`);
      const response = await fetchWithAuth(`${API_BASE_URL}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        body: JSON.stringify({ trackId })
      });
      
      // Check the response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to add track ${trackId}: ${response.status} ${errorText}`);
        throw new Error(`Failed to add track: ${response.status} ${errorText}`);
      } else {
        console.log(`Track ${trackId} added successfully to playlist ${playlistId}`);
      }
    }
    
    // Remove tracks
    for (const trackId of tracksToRemove) {
      console.log(`Removing track ${trackId} from playlist ${playlistId}`);
      await fetchWithAuth(`${API_BASE_URL}/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE'
      });
    }
    
    console.log('Playlist updated successfully:', normalizedData);
    
    // Clear the cache for playlists
    localStorage.removeItem('cache_/playlists');
    
    return normalizedData;
  } catch (error) {
    console.error('Error in updatePlaylist:', error);
    
    // For development mode, return optimistic update even on error
    if (import.meta.env.MODE === 'development') {
      console.warn('Development mode: returning optimistic update despite error');
      return normalizedData;
    }
    
    throw error;
  }
};

// API functions for albums and tracks
export const fetchAlbums = async () => {
  try {
    console.log('Fetching albums...');
    
    const albums = await fetchWithAuth(`${API_BASE_URL}/albums`);
    console.log('Albums fetched successfully:', albums);
    
    // Fetch tracks for each album
    const albumsWithTracks = await Promise.all(
      albums.map(async (album) => {
        try {
          console.log(`Fetching tracks for album ${album.id}`);
          const tracks = await fetchWithAuth(`${API_BASE_URL}/albums/${album.id}/tracks`);
          console.log(`Tracks for album ${album.id}:`, tracks);
          
          // Return album with tracks
          return {
            ...album,
            tracks: tracks.map((track, index) => ({
              ...track,
              id: track.id || `${album.id}-${index + 1}`, // Use track.id if available, otherwise create a unique ID
              _id: track._id || track.id || `${album.id}-${index + 1}`, // Ensure _id is set
              number: track.trackNumber || index + 1, // Use trackNumber if available, otherwise use index
              // Ensure title is set correctly
              title: track.title || track.name || 'Untitled Track',
              // Ensure name is set correctly for consistency
              name: track.name || track.title || 'Untitled Track',
              // Format duration properly if it exists
              duration: track.duration || '0:00'
            }))
          };
        } catch (error) {
          console.error(`Error fetching tracks for album ${album.id}:`, error);
          // Return album with empty tracks array if tracks fetch fails
          return {
            ...album,
            tracks: []
          };
        }
      })
    );
    
    console.log('Albums with tracks:', albumsWithTracks);
    return albumsWithTracks;
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw error;
  }
};

// Function to fetch recommended tracks by tag
export const fetchRecommendedTracks = async (tag) => {
  try {
    if (!tag) {
      throw new Error('Tag is required to fetch recommended tracks');
    }
    
    console.log('Fetching recommended tracks for tag:', tag);
    const tracks = await fetchWithAuth(`${API_BASE_URL}/recommended-tracks?tag=${encodeURIComponent(tag)}`);
    console.log('Recommended tracks fetched successfully:', tracks);
    return tracks;
  } catch (error) {
    console.error('Error fetching recommended tracks:', error);
    throw error;
  }
};

// Function to add a tag to a track
export const addTagToTrack = async (trackId, tag) => {
  try {
    if (!trackId || !tag) {
      throw new Error('Track ID and tag are required');
    }
    
    console.log(`Adding tag "${tag}" to track ${trackId}`);
    const response = await fetchWithAuth(`${API_BASE_URL}/tracks/${trackId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tag })
    });
    
    console.log('Tag added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding tag to track:', error);
    throw error;
  }
};

// Function to remove a tag from a track
export const removeTagFromTrack = async (trackId, tag) => {
  try {
    if (!trackId || !tag) {
      throw new Error('Track ID and tag are required');
    }
    
    console.log(`Removing tag "${tag}" from track ${trackId}`);
    const response = await fetchWithAuth(`${API_BASE_URL}/tracks/${trackId}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE'
    });
    
    console.log('Tag removed successfully:', response);
    return response;
  } catch (error) {
    console.error('Error removing tag from track:', error);
    throw error;
  }
};

// Auth functions
export const login = async () => {
  try {
    // Redirect to Auth0 login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const logout = () => {
  // Clear all cached data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove auth token
  localStorage.removeItem('authToken');
  
  // Redirect to Auth0 logout endpoint
  window.location.href = '/logout';
};

// Function to store Auth0 token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    console.log('Auth token stored successfully');
    return true;
  }
  return false;
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};