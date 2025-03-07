// src/components/TrackItem.jsx

const TrackItem = ({ track }) => {
  // Handle case where track might be just an ID string
  if (typeof track === 'string') {
    return (
      <div className="track-item">
        <div className="track-number"></div>
        <div className="track-info">
          <div className="track-title">Track {track}</div>
          <div className="track-duration">0:00</div>
        </div>
      </div>
    );
  }
  
  // Ensure we have a valid track object
  if (!track || typeof track !== 'object') {
    return (
      <div className="track-item">
        <div className="track-number"></div>
        <div className="track-info">
          <div className="track-title">Unknown Track</div>
          <div className="track-duration">0:00</div>
        </div>
      </div>
    );
  }
  
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

  const displayTitle = track.title || track.name || `Track ${track.id || track._id || ''}`;
  const displayDuration = formatDuration(track.duration);
  const displayNumber = track.number || track.trackNumber || '';
  
  return (
    <div className="track-item">
      <div className="track-number">{displayNumber}</div>
      <div className="track-info">
        <div className="track-title">{displayTitle}</div>
        <div className="track-duration">{displayDuration}</div>
      </div>
    </div>
  );
};

export default TrackItem;