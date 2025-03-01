// src/hooks/useAlbums.js
import { useState, useEffect, useCallback } from 'react';
import { fetchAlbums } from '../utils/api';

export const useAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAlbums();
      setAlbums(data);
      setError(null);
    } catch (err) {
      setError('Failed to load albums');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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