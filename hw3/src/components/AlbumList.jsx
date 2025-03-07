// src/components/AlbumList.jsx
import { useAlbums } from '../hooks/useAlbums';
import TrackItem from './TrackItem';
import LoadingSpinner from './LoadingSpinner';
import { usePlaylists } from '../hooks/usePlaylists';
import { useState, useEffect } from 'react';

const AlbumList = ({ currentPlaylist }) => {
  const { albums, loading, error, loadAlbums } = useAlbums();
  const { editPlaylist } = usePlaylists();
  const [playlistTracksIds, setPlaylistTracksIds] = useState(new Set());
  const [addingTrack, setAddingTrack] = useState(null);
  const [addError, setAddError] = useState(null);
  // New state to track if any button has been clicked
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  // Validate currentPlaylist
  const isValidPlaylist = currentPlaylist && currentPlaylist.id;

  // Force reload albums when component mounts
  useEffect(() => {
    loadAlbums();
    // Reset the buttons disabled state when component mounts
    setButtonsDisabled(false);
  }, [loadAlbums]);

  // Update the set of track IDs when the currentPlaylist changes
  useEffect(() => {
    if (isValidPlaylist && currentPlaylist.tracks) {
      console.log('Updating playlist tracks IDs set:', currentPlaylist.tracks);
      setPlaylistTracksIds(new Set(currentPlaylist.tracks.map(track => track.id)));
    } else {
      setPlaylistTracksIds(new Set());
    }
  }, [currentPlaylist, isValidPlaylist]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const handleAddTrack = async (track) => {
    // Clear previous errors
    setAddError(null);
    
    // Validate playlist
    if (!isValidPlaylist) {
      setAddError('Cannot add track: Invalid playlist');
      return;
    }
    
    // Only add if not already in playlist
    if (!playlistTracksIds.has(track.id)) {
      // Disable all other buttons
      setButtonsDisabled(true);
      setAddingTrack(track.id);
      
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
      
      // Ensure track has consistent ID fields
      const normalizedTrack = { 
        ...track,
        _id: track._id || track.id,
        id: track.id || track._id
      };
      
      // Make sure the track has all required fields for display
      if (!normalizedTrack.title && normalizedTrack.name) {
        normalizedTrack.title = normalizedTrack.name;
      }
      if (!normalizedTrack.name && normalizedTrack.title) {
        normalizedTrack.name = normalizedTrack.title;
      }
      normalizedTrack.duration = formatDuration(normalizedTrack.duration);
      normalizedTrack.number = normalizedTrack.number || normalizedTrack.trackNumber || 0;
      
      // Prepare the updated tracks list for the UI
      const updatedTracks = [...currentPlaylist.tracks, normalizedTrack];
      
      setPlaylistTracksIds(prev => new Set([...prev, track.id]));
      
      try {
        console.log('Adding track to playlist:', normalizedTrack);
        console.log('Current playlist:', currentPlaylist);
        
        // Ensure the playlist has consistent ID fields
        const normalizedPlaylist = { 
          ...currentPlaylist,
          id: currentPlaylist.id || currentPlaylist._id,
          _id: currentPlaylist._id || currentPlaylist.id
        };
        
        // For the backend API, we need to send the track ID in the format expected by the backend
        const result = await editPlaylist(normalizedPlaylist.id, {
          ...normalizedPlaylist,
          tracks: updatedTracks
        });
        
        // Check if the result is valid
        if (!result || (!result.id && !result._id)) {
          throw new Error('Server returned invalid data');
        }
        
        // Store the updated playlist in local storage as a backup
        localStorage.setItem(`playlist_backup_${normalizedPlaylist.id}`, JSON.stringify({
          ...normalizedPlaylist,
          tracks: updatedTracks
        }));
        
        console.log('Track added successfully');
      } catch (err) {
        console.error('Failed to add track to playlist:', err);
        
        // Check if it's a server connection error
        const isServerError = err.message && (
          err.message.includes('500') || 
          err.message.includes('EAGAIN') || 
          err.message.includes('network')
        );
        
        if (isServerError) {
          setAddError(
            'The track was added locally, but there was a server connection issue. ' +
            'Your changes will be saved when the connection is restored.'
          );
          
          // Store the updated playlist in local storage as a backup
          localStorage.setItem(`playlist_backup_${currentPlaylist.id || currentPlaylist._id}`, JSON.stringify({
            ...currentPlaylist,
            tracks: updatedTracks
          }));
        } else {
          setPlaylistTracksIds(prev => {
            const newSet = new Set([...prev]);
            newSet.delete(track.id);
            return newSet;
          });
          
          setAddError(`Failed to add track: ${err.message || 'Unknown error'}`);
          
          setButtonsDisabled(false);
        }
      } finally {
        setAddingTrack(null);
      }
    } else {
      setAddError('This track is already in the playlist');
    }
  };

  return (
    <div className="album-list">
      
      <h3>Available Albums and Tracks</h3>
      
      {addError && <div className="error">{addError}</div>}
      
      {buttonsDisabled && !addError && (
        <div className="info-message">
          Track has been added to the playlist. Other add buttons are disabled until you navigate away and return.
        </div>
      )}
      
      {albums.length === 0 ? (
        <p>No albums available</p>
      ) : (
        <div className="albums">
          {albums.map(album => (
            <div key={album.id} className="album-item">
              <div className="album-info">
                <h4>{album.name || album.title}</h4>
                <p>Genre: {album.genre}</p>
                <p>Year: {album.yearReleased || album.year}</p>
              </div>
              
              <div className="album-tracks">
                <h5>Tracks:</h5>
                {album.tracks ? (
                  album.tracks.map(track => (
                    <div key={track.id} className="album-track-item">
                      <TrackItem track={track} />
                      {isValidPlaylist ? (
                        playlistTracksIds.has(track.id) ? (
                          <span className="track-added">✓ Added</span>
                        ) : (
                          <button 
                            onClick={() => handleAddTrack(track)}
                            className="add-track-btn"
                            disabled={addingTrack === track.id || buttonsDisabled}
                          >
                            {addingTrack === track.id ? 'Adding...' : 'Add to Playlist'}
                          </button>
                        )
                      ) : (
                        <button className="add-track-btn disabled" disabled>
                          Cannot Add Track
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No tracks available for this album. The server response doesn't include track data.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumList;