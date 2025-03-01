// src/pages/EditPlaylist.jsx
import { useParams } from 'react-router-dom';
import EditPlaylistForm from '../components/EditPlaylistForm';
import AlbumList from '../components/AlbumList';
import { usePlaylists } from '../hooks/usePlaylists';
import { useState, useEffect } from 'react';

const EditPlaylist = () => {
  const { id } = useParams();
  const { playlists, loading, error } = usePlaylists();
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    if (!loading && playlists.length > 0) {
      const foundPlaylist = playlists.find(p => p.id === id);
      setPlaylist(foundPlaylist);
    }
  }, [id, playlists, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!playlist) {
    return <div>Playlist not found</div>;
  }

  return (
    <div className="edit-playlist-page">
      <h2>Edit Playlist: {playlist.name}</h2>
      <div className="edit-playlist-content">
        <EditPlaylistForm playlist={playlist} />
        <AlbumList currentPlaylist={playlist} />
      </div>
    </div>
  );
};

export default EditPlaylist;