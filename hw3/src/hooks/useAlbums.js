// src/hooks/useAlbums.js
import { useState, useEffect, useCallback } from 'react';
import { fetchAlbums } from '../utils/api';

export const useAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    try {
      // Try to get cached data first while waiting for the API
      const cachedData = localStorage.getItem('cache_/albums');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log('Using cached albums data:', parsedData);
        setAlbums(parsedData);
      }
      
      console.log('Loading albums...');
      const data = await fetchAlbums();
      console.log('Albums loaded:', data);
      
      if (Array.isArray(data)) {
        // Ensure each album has a tracks array
        const enhancedAlbums = data.map(album => {
          if (!album.tracks) {
            return {
              ...album,
              tracks: [] // Add empty tracks array if missing
            };
          }
          return album;
        });
        
        console.log('Enhanced albums with tracks arrays:', enhancedAlbums);
        setAlbums(enhancedAlbums);
        setError(null);
      } else {
        console.error('Invalid albums data format:', data);
        setError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Error loading albums:', err);
      
      // If we have cached data, don't show an error
      const cachedData = localStorage.getItem('cache_/albums');
      if (!cachedData) {
        setError('Failed to load albums. Please check your connection and try again.');
      }
      
      // Retry logic for network issues
      if (retryCount < 3) {
        console.log(`Retrying albums fetch (${retryCount + 1}/3)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(loadAlbums, 2000); // Retry after 2 seconds
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  return {
    albums,
    loading,
    error,
    loadAlbums
  };
};