// src/pages/EditPlaylist.jsx
import { useParams, useNavigate } from 'react-router-dom';
import EditPlaylistForm from '../components/EditPlaylistForm';
import AlbumList from '../components/AlbumList';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePlaylists } from '../hooks/usePlaylists';
import { useState, useEffect } from 'react';

const EditPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, loading, error, loadPlaylists } = usePlaylists();
  const [playlist, setPlaylist] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);

  // Check if ID is valid
  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Playlist ID is undefined or invalid:', id);
      setNotFound(true);
      setLoadingPlaylist(false);
      // Redirect after a short delay
      const timer = setTimeout(() => navigate('/'), 2000);
      return () => clearTimeout(timer);
    }
  }, [id, navigate]);

  // Force reload playlists when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadPlaylists();
      } catch (err) {
        console.error('Error loading playlists:', err);
      }
    };
    
    loadData();
  }, [loadPlaylists]);

  // Find the playlist once playlists are loaded
  useEffect(() => {
    if (!loading && playlists.length > 0 && id) {
      console.log('Looking for playlist with ID:', id);
      console.log('Available playlists:', playlists);
      
      // Convert IDs to strings for comparison since URL params are always strings
      const foundPlaylist = playlists.find(p => String(p.id) === String(id));
      
      if (foundPlaylist) {
        console.log('Found playlist:', foundPlaylist);
        setPlaylist(foundPlaylist);
        setNotFound(false);
      } else {
        console.log('Playlist not found. Available playlists:', playlists);
        setNotFound(true);
        // Redirect after a short delay
        const timer = setTimeout(() => navigate('/'), 3000);
        return () => clearTimeout(timer);
      }
      
      setLoadingPlaylist(false);
    } else if (!loading) {
      // If playlists are loaded but empty
      setLoadingPlaylist(false);
    }
  }, [id, playlists, loading, navigate]);

  if (loading || loadingPlaylist) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Playlists
        </button>
      </div>
    );
  }

  if (notFound || !id) {
    return (
      <div className="not-found">
        <h2>Playlist Not Found</h2>
        <p>The playlist you're looking for doesn't exist or you don't have permission to view it.</p>
        <p>Redirecting to home page...</p>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Playlists
        </button>
      </div>
    );
  }

  if (!playlist) {
    return <LoadingSpinner />;
  }

  return (
    <div className="edit-playlist-page">
      <h2>Edit Playlist</h2>
      <div className="edit-playlist-content">
        <EditPlaylistForm playlist={playlist} />
        <AlbumList currentPlaylist={playlist} />
      </div>
    </div>
  );
};

export default EditPlaylist;