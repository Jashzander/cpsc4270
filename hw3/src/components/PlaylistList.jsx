// src/components/PlaylistList.jsx
import { Link } from 'react-router-dom';
import PlaylistItem from './PlaylistItem';
import LoadingSpinner from './LoadingSpinner';
import { usePlaylists } from '../hooks/usePlaylists';
import { useEffect } from 'react';

const PlaylistList = () => {
  const { playlists, loading, error, loadPlaylists } = usePlaylists();

  // Force reload playlists when component mounts
  useEffect(() => {
    // Also check cached data for _id to id mapping
    const cachedData = localStorage.getItem('cache_/playlists');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        // Map MongoDB _id to id for frontend compatibility in cached data
        const mappedCachedPlaylists = parsedData.map(playlist => {
          if (playlist._id && !playlist.id) {
            return {
              ...playlist,
              id: playlist._id
            };
          }
          return playlist;
        });
        
        // Update localStorage with the mapped data
        localStorage.setItem('cache_/playlists', JSON.stringify(mappedCachedPlaylists));
      } catch (e) {
        console.error('Error processing cached playlists:', e);
      }
    }
    
    loadPlaylists();
  }, [loadPlaylists]);

  // Filter out any playlists with invalid IDs
  const validPlaylists = playlists.filter(playlist => playlist && (playlist.id || playlist._id));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="playlist-list">
      <div className="playlist-header">
        <h2>Your Playlists</h2>
        <Link to="/playlists/new" className="new-playlist-btn">
          Create New Playlist
        </Link>
      </div>

      {validPlaylists.length === 0 ? (
        <p>You don't have any playlists yet. Create one to get started!</p>
      ) : (
        <div className="playlists">
          {validPlaylists.map(playlist => (
            <PlaylistItem 
              key={playlist.id || playlist._id} 
              playlist={playlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistList;