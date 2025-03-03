// src/components/PlaylistItem.jsx
import { Link } from 'react-router-dom';

const PlaylistItem = ({ playlist }) => {
  // Ensure playlist ID is valid before rendering the link
  const playlistId = playlist?.id || playlist?._id;
  if (!playlistId) {
    console.error('Invalid playlist ID:', playlist);
  }

  return (
    <div className="playlist-item">
      <div className="playlist-info">
        <h3>{playlist.name}</h3>
        <p className="playlist-status">
          {playlist.isPublic ? 'Public' : 'Private'}
        </p>
      </div>
      <div className="playlist-actions">
        {playlistId ? (
          <Link to={`/playlists/${playlistId}/edit`} className="edit-playlist-btn">
            Edit Playlist
          </Link>
        ) : (
          <button className="edit-playlist-btn disabled" disabled>
            Edit Playlist
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaylistItem;