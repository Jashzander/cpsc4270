// src/components/AlbumList.jsx
import { useAlbums } from '../hooks/useAlbums';
import TrackItem from './TrackItem';
import { usePlaylists } from '../hooks/usePlaylists';
import { useState } from 'react';

const AlbumList = ({ currentPlaylist }) => {
  const { albums, loading, error } = useAlbums();
  const { editPlaylist } = usePlaylists();
  const [playlistTracksIds, setPlaylistTracksIds] = useState(
    new Set(currentPlaylist.tracks.map(track => track.id))
  );

  if (loading) {
    return <div>Loading albums...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const handleAddTrack = async (track) => {
    // Only add if not already in playlist
    if (!playlistTracksIds.has(track.id)) {
      const updatedTracks = [...currentPlaylist.tracks, track];
      
      try {
        await editPlaylist(currentPlaylist.id, {
          ...currentPlaylist,
          tracks: updatedTracks
        });
        
        // Update local state
        setPlaylistTracksIds(prev => new Set([...prev, track.id]));
      } catch (err) {
        console.error('Failed to add track to playlist:', err);
      }
    }
  };

  return (
    <div className="album-list">
      <h3>Available Albums and Tracks</h3>
      {albums.length === 0 ? (
        <p>No albums available</p>
      ) : (
        <div className="albums">
          {albums.map(album => (
            <div key={album.id} className="album-item">
              <div className="album-info">
                <h4>{album.title}</h4>
                <p>Artist: {album.artist}</p>
                <p>Year: {album.year}</p>
              </div>
              
              <div className="album-tracks">
                <h5>Tracks:</h5>
                {album.tracks.map(track => (
                  <div key={track.id} className="album-track-item">
                    <TrackItem track={track} />
                    {playlistTracksIds.has(track.id) ? (
                      <span className="track-added">✓ Added</span>
                    ) : (
                      <button 
                        onClick={() => handleAddTrack(track)}
                        className="add-track-btn"
                      >
                        Add to Playlist
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumList;