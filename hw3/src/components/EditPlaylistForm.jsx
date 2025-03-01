// src/components/EditPlaylistForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylists } from '../hooks/usePlaylists';
import TrackItem from './TrackItem';

const EditPlaylistForm = ({ playlist }) => {
  const [playlistData, setPlaylistData] = useState({
    name: playlist.name,
    isPublic: playlist.isPublic,
    tracks: [...playlist.tracks]
  });
  const [error, setError] = useState('');
  const { editPlaylist } = usePlaylists();
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
    
    try {
      await editPlaylist(playlist.id, playlistData);
      navigate('/');
    } catch {
      setError('Failed to update playlist');
    }
  };

  const removeTrack = (trackId) => {
    setPlaylistData(prev => ({
      ...prev,
      tracks: prev.tracks.filter(track => track.id !== trackId)
    }));
  };

  const moveTrack = (trackId, direction) => {
    const trackIndex = playlistData.tracks.findIndex(track => track.id === trackId);
    if (
      (direction === 'up' && trackIndex === 0) || 
      (direction === 'down' && trackIndex === playlistData.tracks.length - 1)
    ) {
      return;
    }

    const newTracks = [...playlistData.tracks];
    const targetIndex = direction === 'up' ? trackIndex - 1 : trackIndex + 1;
    
    [newTracks[trackIndex], newTracks[targetIndex]] = 
    [newTracks[targetIndex], newTracks[trackIndex]];
    
    setPlaylistData(prev => ({
      ...prev,
      tracks: newTracks
    }));
  };

  return (
    <div className="edit-playlist-form-container">
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
        
        <div className="tracks-container">
          <h3>Tracks in this Playlist</h3>
          {playlistData.tracks.length === 0 ? (
            <p>No tracks in this playlist. Add tracks from the albums below.</p>
          ) : (
            <div className="tracks-list">
              {playlistData.tracks.map((track, index) => (
                <div key={track.id} className="playlist-track-item">
                  <TrackItem track={track} />
                  <div className="track-actions">
                    <button 
                      type="button" 
                      onClick={() => moveTrack(track.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button 
                      type="button" 
                      onClick={() => moveTrack(track.id, 'down')}
                      disabled={index === playlistData.tracks.length - 1}
                    >
                      ↓
                    </button>
                    <button 
                      type="button" 
                      onClick={() => removeTrack(track.id)}
                      className="remove-track"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPlaylistForm;