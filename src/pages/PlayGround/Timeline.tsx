import React from 'react';

const Timeline = ({ duration, currentTime, clips, onDelete, onSelectClip }) => {
  if (!duration) return <div className="h-16 bg-gray-800 rounded-lg"></div>;

  const percentComplete = (currentTime / duration) * 100;
  
  return (
    <div className="h-32 bg-gray-800 rounded-lg p-2 overflow-hidden">
      <div className="relative h-full">
        {/* Time markers */}
        <div className="absolute top-0 w-full flex justify-between text-xs text-gray-400 px-2">
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <span key={fraction}>
              {formatTime(duration * fraction)}
            </span>
          ))}
        </div>
        
        {/* Clips */}
        <div className="absolute top-6 bottom-0 w-full">
          {clips.map((clip) => {
            const startPercent = (clip.start / duration) * 100;
            const endPercent = (clip.end / duration) * 100;
            const width = endPercent - startPercent;
            
            return (
              <div 
                key={clip.id}
                className={`absolute h-12 rounded cursor-pointer flex items-center justify-center
                           ${clip.type === 'main' ? 'bg-blue-700' : 'bg-green-700'}`}
                style={{ 
                  left: `${startPercent}%`, 
                  width: `${width}%`,
                }}
                onClick={() => onSelectClip(clip.id)}
              >
                {clip.type !== 'main' && (
                  <button 
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(clip.id);
                    }}
                  >
                    ×
                  </button>
                )}
                <span className="text-xs truncate">
                  {formatTime(clip.start)} - {formatTime(clip.end)}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Current time indicator */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
          style={{ left: `${percentComplete}%` }}
        />
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default Timeline;