// src/hooks/usePlaylists.js
import { useState, useEffect, useCallback } from 'react';
import { fetchPlaylists, createPlaylist, updatePlaylist } from '../utils/api';

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlaylists();
      setPlaylists(data);
      setError(null);
    } catch (err) {
      setError('Failed to load playlists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const addPlaylist = async (playlistData) => {
    try {
      const newPlaylist = await createPlaylist(playlistData);
      setPlaylists([...playlists, newPlaylist]);
      return newPlaylist;
    } catch (err) {
      setError('Failed to create playlist');
      throw err;
    }
  };

  const editPlaylist = async (id, playlistData) => {
    try {
      const updatedPlaylist = await updatePlaylist(id, playlistData);
      setPlaylists(
        playlists.map(playlist => 
          playlist.id === id ? updatedPlaylist : playlist
        )
      );
      return updatedPlaylist;
    } catch (err) {
      setError('Failed to update playlist');
      throw err;
    }
  };

  return {
    playlists,
    loading,
    error,
    loadPlaylists,
    addPlaylist,
    editPlaylist
  };
};