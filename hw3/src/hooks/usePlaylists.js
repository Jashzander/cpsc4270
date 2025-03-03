// src/hooks/usePlaylists.js
import { useState, useEffect, useCallback } from 'react';
import { fetchPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../utils/api';

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    let loadedFromCache = false;
    
    try {
      // Try to get cached data first while waiting for the API
      const cachedData = localStorage.getItem('cache_/playlists');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          console.log('Using cached playlists data:', parsedData);
          
          // Ensure all playlists have valid IDs
          const validPlaylists = parsedData.filter(p => p && (p.id || p._id)).map(playlist => {
            // Normalize IDs
            const normalizedPlaylist = { ...playlist };
            if (!normalizedPlaylist.id && normalizedPlaylist._id) {
              normalizedPlaylist.id = normalizedPlaylist._id;
            } else if (!normalizedPlaylist._id && normalizedPlaylist.id) {
              normalizedPlaylist._id = normalizedPlaylist.id;
            }
            
            // Ensure tracks is always an array
            if (!Array.isArray(normalizedPlaylist.tracks)) {
              normalizedPlaylist.tracks = [];
            }
            
            return normalizedPlaylist;
          });
          
          setPlaylists(validPlaylists);
          loadedFromCache = true;
          setError(null);
        } catch (cacheError) {
          console.error('Error parsing cached playlists:', cacheError);
          // If cache is corrupted, clear it
          localStorage.removeItem('cache_/playlists');
        }
      }
      
      // Try to fetch from server
      try {
        const data = await fetchPlaylists();
        console.log('Loaded playlists in hook:', data);
        
        if (Array.isArray(data)) {
          // Map MongoDB _id to id for frontend compatibility
          const mappedPlaylists = data.map(playlist => {
            // Create a new object with both id and _id
            const normalizedPlaylist = {
              ...playlist,
              id: playlist._id || playlist.id || Date.now().toString(),
              // Ensure tracks is always an array
              tracks: Array.isArray(playlist.tracks) ? playlist.tracks.map(trackId => {
                // If the track is just an ID string, convert it to an object
                if (typeof trackId === 'string') {
                  const trackData = data.find(track => track.id === trackId); // Find the track data by ID
                  return {
                    id: trackId,
                    _id: trackId,
                    title: trackData ? trackData.title : `Track ID: ${trackId}`, // Use title from trackData or fallback
                    number: trackData ? trackData.trackNumber : 1, // Use trackNumber from trackData or fallback
                    duration: trackData ? trackData.duration : '0:00' // Use duration from trackData or fallback
                  };
                }
                return trackId;
              }) : []
            };
            
            // Ensure _id is also set
            if (!normalizedPlaylist._id) {
              normalizedPlaylist._id = normalizedPlaylist.id;
            }
            
            return normalizedPlaylist;
          });
          
          console.log('Mapped playlists with proper IDs:', mappedPlaylists);
          setPlaylists(mappedPlaylists);
          setError(null);
          
          // Update cache with fresh data
          localStorage.setItem('cache_/playlists', JSON.stringify(mappedPlaylists));
        } else {
          console.error('Invalid playlists data format:', data);
          // Only set error if we didn't load from cache
          if (!loadedFromCache) {
            setError('Received invalid data format from server');
          }
        }
      } catch (fetchError) {
        console.error('Error fetching playlists:', fetchError);
        // Only set error if we didn't load from cache
        if (!loadedFromCache) {
          setError('Failed to load playlists. Using cached data if available.');
        }
        
        // If we have retry attempts left and no cached data, retry
        if (retryCount < 3 && !loadedFromCache) {
          console.log(`Retrying playlists fetch (${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
          setTimeout(loadPlaylists, 2000); // Retry after 2 seconds
        }
      }
    } catch (err) {
      console.error('Unexpected error in loadPlaylists:', err);
      if (!loadedFromCache) {
        setError('An unexpected error occurred while loading playlists');
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const addPlaylist = async (playlistData) => {
    try {
      // Validate data
      if (!playlistData || !playlistData.name) {
        throw new Error('Invalid playlist data: name is required');
      }
      
      console.log('Adding playlist in hook:', playlistData);
      
      // Create the playlist
      const newPlaylist = await createPlaylist(playlistData);
      console.log('New playlist created:', newPlaylist);
      
      // Reload playlists to ensure we have the latest data
      await loadPlaylists();
      
      return newPlaylist;
    } catch (err) {
      setError('Failed to create playlist');
      console.error('Error in addPlaylist:', err);
      throw err;
    }
  };

  const editPlaylist = async (id, playlistData) => {
    try {
      // Validate ID
      if (!id) {
        console.error('Invalid playlist ID for edit:', id);
        throw new Error('Invalid playlist ID');
      }
      
      console.log('Editing playlist in hook:', id, playlistData);
      console.log('isPublic value in hook:', playlistData.isPublic);
      
      // Ensure the playlist data has consistent ID fields
      const normalizedData = { 
        ...playlistData,
        id: id,
        _id: playlistData._id || id,
        isPublic: playlistData.isPublic === true // Ensure boolean value
      };
      
      const updatedPlaylist = await updatePlaylist(id, normalizedData);
      console.log('Updated playlist:', updatedPlaylist);
      
      // Handle ID inconsistency - server might return _id instead of id
      let validatedPlaylist = { ...updatedPlaylist };
      
      // If the playlist is missing an ID but has _id, use that
      if (!validatedPlaylist.id && validatedPlaylist._id) {
        validatedPlaylist.id = validatedPlaylist._id;
        console.log('Using _id as id:', validatedPlaylist);
      }
      
      // If the playlist is still missing an ID, use the original ID
      if (!validatedPlaylist.id && !validatedPlaylist._id) {
        validatedPlaylist.id = id;
        validatedPlaylist._id = id;
        console.log('Using original ID for playlist:', validatedPlaylist);
      }
      
      // Validate the updated playlist
      if (!validatedPlaylist.id) {
        console.error('Updated playlist is missing ID:', validatedPlaylist);
        throw new Error('Updated playlist is missing ID');
      }
      
      // Reload playlists to ensure we have the latest data
      await loadPlaylists();
      
      return validatedPlaylist;
    } catch (err) {
      setError('Failed to update playlist');
      console.error('Error in editPlaylist:', err);
      throw err;
    }
  };

  const removePlaylist = async (id) => {
    try {
      if (!id) {
        throw new Error('Invalid playlist ID for removal');
      }
      
      console.log('Removing playlist in hook:', id);
      await deletePlaylist(id);
      
      // Update local state immediately for better UX
      setPlaylists(prev => prev.filter(p => p.id !== id && p._id !== id));
      
      // Then reload from server to ensure consistency
      await loadPlaylists();
      
      return true;
    } catch (err) {
      setError('Failed to remove playlist');
      console.error('Error in removePlaylist:', err);
      
      // For server errors, still update the UI
      if (err.message && (err.message.includes('500') || err.message.includes('network'))) {
        console.warn('Server error on delete, updating UI anyway');
        setPlaylists(prev => prev.filter(p => p.id !== id && p._id !== id));
        return true;
      }
      
      throw err;
    }
  };

  return {
    playlists,
    loading,
    error,
    loadPlaylists,
    addPlaylist,
    editPlaylist,
    removePlaylist
  };
};