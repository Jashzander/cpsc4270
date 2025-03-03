// src/components/NewPlaylistForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylists } from '../hooks/usePlaylists';

const NewPlaylistForm = () => {
  const [playlistData, setPlaylistData] = useState({
    name: '',
    isPublic: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPlaylist } = usePlaylists();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlaylistData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!playlistData.name.trim()) {
      setError('Playlist name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Submitting new playlist:', {
        name: playlistData.name,
        isPublic: playlistData.isPublic,
        tracks: []
      });
      
      const newPlaylist = await addPlaylist({
        name: playlistData.name,
        isPublic: playlistData.isPublic,
        tracks: []
      });
      
      console.log('Playlist created successfully:', newPlaylist);
      navigate('/');
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="playlist-form">
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Playlist Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={playlistData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="isPublic"
            checked={playlistData.isPublic}
            onChange={handleChange}
          />
          Make this playlist public
        </label>
      </div>
      
      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Playlist'}
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/')}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default NewPlaylistForm;