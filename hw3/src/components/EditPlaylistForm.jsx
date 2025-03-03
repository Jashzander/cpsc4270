// src/components/EditPlaylistForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylists } from '../hooks/usePlaylists';
import TrackItem from './TrackItem';
import { fetchAlbums } from '../utils/api';

const EditPlaylistForm = ({ playlist }) => {
  const [playlistData, setPlaylistData] = useState({
    name: '',
    isPublic: false,
    tracks: []
  });
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [allTracks, setAllTracks] = useState([]);
  const { editPlaylist } = usePlaylists();
  const navigate = useNavigate();

  // Fetch all albums to get track information
  useEffect(() => {
    const loadAllTracks = async () => {
      try {
        const albums = await fetchAlbums();
        // Extract all tracks from all albums
        const tracks = albums.flatMap(album => 
          album.tracks.map(track => ({
            ...track,
            albumName: album.name,
            albumId: album.id
          }))
        );
        setAllTracks(tracks);
      } catch (err) {
        console.error('Error loading tracks:', err);
        setWarning('Could not load complete track information. Some track details may be missing.');
      }
    };
    
    loadAllTracks();
  }, []);

  // Validate playlist prop
  useEffect(() => {
    if (!playlist || !playlist.id) {
      console.error('Invalid playlist provided to EditPlaylistForm:', playlist);
      setError('Invalid playlist data. Redirecting to home...');
      // Redirect after a short delay to show the error
      const timer = setTimeout(() => navigate('/'), 2000);
      return () => clearTimeout(timer);
    }
  }, [playlist, navigate]);

  // Format duration if it's in seconds
  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    
    // If duration is already formatted as MM:SS, return it
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // If duration is a number (seconds), format it as MM:SS
    if (typeof duration === 'number' || !isNaN(Number(duration))) {
      const totalSeconds = Number(duration);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return duration || '0:00';
  };

  // Update form data when playlist prop changes
  useEffect(() => {
    if (playlist) {
      // Ensure tracks are properly formatted for display
      const formattedTracks = (playlist.tracks || []).map(track => {
        // If track is already an object with all required fields, use it
        if (typeof track === 'object' && track.id) {
          // Find complete track info from allTracks if available
          const completeTrack = allTracks.find(t => t.id === track.id || t._id === track.id);
          
          if (completeTrack) {
            return {
              ...completeTrack,
              id: track.id || track._id,
              _id: track._id || track.id
            };
          }
          
          // Ensure it has all required display fields
          return {
            ...track,
            title: track.title || track.name || `Track ${track.id}`,
            name: track.name || track.title || `Track ${track.id}`,
            duration: formatDuration(track.duration),
            number: track.number || track.trackNumber || 0,
            id: track.id || track._id,
            _id: track._id || track.id
          };
        }
        // If track is just an ID string, convert it to an object
        // Try to find complete track info from allTracks
        const completeTrack = allTracks.find(t => t.id === track || t._id === track);
        
        if (completeTrack) {
          return {
            ...completeTrack,
            id: track,
            _id: track
          };
        }
        
        return {
          id: track,
          _id: track,
          title: `Track ${track}`,
          name: `Track ${track}`,
          number: 0,
          duration: '0:00'
        };
      });

      // Log the isPublic value from the playlist prop
      console.log('Initializing form with isPublic value:', playlist.isPublic);
      
      setPlaylistData({
        name: playlist.name || '',
        isPublic: playlist.isPublic === true, // Ensure boolean value
        tracks: formattedTracks,
        id: playlist.id,
        _id: playlist._id || playlist.id
      });
    }
  }, [playlist, allTracks]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    console.log(`Updating ${name} to:`, newValue, 'type:', type);
    
    setPlaylistData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setWarning('');
    setSaveSuccess(false);
    
    if (!playlistData.name.trim()) {
      setError('Playlist name is required');
      return;
    }
    
    if (!playlist || !playlist.id) {
      setError('Cannot update playlist: Invalid ID');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Explicitly log the isPublic property to verify it's being included
      console.log('Submitting updated playlist with isPublic:', playlistData.isPublic);
      console.log('Submitting updated playlist:', playlistData);
      
      // Ensure the playlist data has consistent ID fields
      const normalizedData = { 
        ...playlistData,
        id: playlist.id,
        _id: playlist._id || playlist.id,
        isPublic: playlistData.isPublic // Explicitly include isPublic property
      };
      
      // Ensure tracks have proper format for the backend
      normalizedData.tracks = normalizedData.tracks.map(track => {
        // If track is already an object, ensure it has an id and preserve all track details
        if (typeof track === 'object') {
          // Find complete track info from allTracks if available
          const completeTrack = allTracks.find(t => t.id === track.id || t._id === track.id);
          
          if (completeTrack) {
            return {
              ...completeTrack,
              id: track.id || track._id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              _id: track._id || track.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: completeTrack.title || completeTrack.name || track.title || track.name || `Track ${track.id || track._id}`,
              name: completeTrack.name || completeTrack.title || track.name || track.title || `Track ${track.id || track._id}`,
              duration: completeTrack.duration || track.duration || '0:00',
              number: completeTrack.number || completeTrack.trackNumber || track.number || track.trackNumber || 0
            };
          }
          
          return {
            ...track,
            id: track.id || track._id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            _id: track._id || track.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: track.title || track.name || `Track ${track.id || track._id}`,
            name: track.name || track.title || `Track ${track.id || track._id}`,
            duration: formatDuration(track.duration),
            number: track.number || track.trackNumber || 0
          };
        }
        // If track is just an ID string, convert it to an object
        // Try to find complete track info from allTracks
        const completeTrack = allTracks.find(t => t.id === track || t._id === track);
        
        if (completeTrack) {
          return {
            ...completeTrack,
            id: track,
            _id: track
          };
        }
        
        return {
          id: track,
          _id: track,
          title: `Track ${track}`,
          name: `Track ${track}`,
          number: 0,
          duration: '0:00'
        };
      });
      
      // Save a local copy for optimistic updates
      const localCopy = JSON.stringify(normalizedData);
      localStorage.setItem(`playlist_backup_${playlist.id}`, localCopy);
      
      const updatedPlaylist = await editPlaylist(playlist.id, normalizedData);
      console.log('Playlist updated successfully:', updatedPlaylist);
      
      // Show success message
      setSaveSuccess(true);
      
      // Navigate after a short delay to show the success message
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Error updating playlist:', err);
      setError(`Failed to update playlist: ${err.message || 'Unknown error'}`);
      setIsSubmitting(false);
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

  // If there's a critical error, just show the error message
  if (error && !playlist?.id) {
    return (
      <div className="edit-playlist-form-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="edit-playlist-form-container">
      <form onSubmit={handleSubmit} className="playlist-form">
        {error && <div className="error">{error}</div>}
        {warning && <div className="warning">{warning}</div>}
        {saveSuccess && <div className="success">Playlist saved successfully!</div>}
        
        <div className="form-group">
          <label htmlFor="name">Playlist Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={playlistData.name}
            onChange={handleChange}
            required
            readOnly
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
          <button type="submit" disabled={isSubmitting || !playlist?.id}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            disabled={isSubmitting}
          >
            Back
          </button>
          
        </div>
        <p>Note:</p>
        <p>Tracks get automatically added to playlist no need to save, for everything else please click on Save Changes</p>
      </form>
    </div>
  );
};

export default EditPlaylistForm;