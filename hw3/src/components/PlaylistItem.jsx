// src/components/PlaylistItem.jsx
import { Link } from 'react-router-dom';

const PlaylistItem = ({ playlist }) => {
  return (
    <div className="playlist-item">
      <div className="playlist-info">
        <h3>{playlist.name}</h3>
        <p className="playlist-status">
          {playlist.isPublic ? 'Public' : 'Private'}
        </p>
      </div>
      <div className="playlist-actions">
        <Link to={`/playlists/${playlist.id}/edit`} className="edit-playlist-btn">
          Edit Playlist
        </Link>
      </div>
    </div>
  );
};

export default PlaylistItem;