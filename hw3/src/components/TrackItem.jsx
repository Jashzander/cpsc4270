// src/components/TrackItem.jsx

const TrackItem = ({ track }) => {
    return (
      <div className="track-item">
        <div className="track-number">{track.number}</div>
        <div className="track-info">
          <div className="track-title">{track.title}</div>
          <div className="track-duration">{formatDuration(track.duration)}</div>
        </div>
      </div>
    );
  };
  
  // Helper function to format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  export default TrackItem;