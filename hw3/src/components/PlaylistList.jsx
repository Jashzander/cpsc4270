// src/components/PlaylistList.jsx
import { Link } from 'react-router-dom';
import PlaylistItem from './PlaylistItem';
import { usePlaylists } from '../hooks/usePlaylists';

const PlaylistList = () => {
  const { playlists, loading, error } = usePlaylists();

  if (loading) {
    return <div>Loading playlists...</div>;
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

      {playlists.length === 0 ? (
        <p>You don't have any playlists yet. Create one to get started!</p>
      ) : (
        <div className="playlists">
          {playlists.map(playlist => (
            <PlaylistItem 
              key={playlist.id} 
              playlist={playlist} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistList;