import { useRef, useEffect, useState } from 'react';
import useEditorStore from './_store/editorStore';
import Track from './Track';

export default function Timeline({ videoRef, audioRef }) {
  const { timelineTracks, zoom, currentTime, setCurrentTime, addTrack } = useEditorStore();
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate maximum timeline duration based on all clips
  const calculateMaxDuration = () => {
    let maxDuration = 60; // Default minimum duration
    
    // Check all tracks and clips to find the furthest end point
    Object.keys(timelineTracks).forEach(mediaType => {
      timelineTracks[mediaType].forEach(track => {
        track.clips.forEach(clip => {
          const clipEnd = clip.startTime + clip.duration;
          if (clipEnd > maxDuration) {
            maxDuration = clipEnd;
          }
        });
      });
    });
    
    // Add some padding
    return maxDuration + 10;
  };

  const maxDuration = calculateMaxDuration();
  const timelineWidth = maxDuration * zoom;
  const playheadPosition = currentTime * zoom;

  const updateTimeFromEvent = (e) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(x / zoom, maxDuration));
    setCurrentTime(newTime);

    // Update media elements
    if (videoRef?.current) videoRef.current.currentTime = newTime;
    if (audioRef?.current) audioRef.current.currentTime = newTime;
  };

  const handleMouseDown = (e) => {
    if (e.target === timelineRef.current || e.target.classList.contains('timeline-track')) {
      setIsDragging(true);
      updateTimeFromEvent(e);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      updateTimeFromEvent(e);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="relative overflow-x-auto">
      <div
        ref={timelineRef}
        className="relative bg-gray-50"
        style={{ width: `${timelineWidth}px`, minWidth: '1000px' }}
        onMouseDown={handleMouseDown}
      >
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-30"
          style={{
            left: `${playheadPosition}px`,
            cursor: 'ew-resize',
          }}
        />

        {/* Track groups */}
        <div className="p-2 space-y-4">
          {/* Video track group */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Video Tracks</h3>
              <button 
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => addTrack('video')}
              >
                + Add Video Track
              </button>
            </div>
            
            <div className="space-y-2">
              {timelineTracks.video.map((track) => (
                <Track 
                  key={track.id}
                  trackId={track.id}
                  title={`Video ${track.id.split('-').pop()}`}
                  type="video"
                  clips={track.clips}
                />
              ))}
            </div>
          </div>
          
          {/* Audio track group */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Audio Tracks</h3>
              <button 
                className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                onClick={() => addTrack('audio')}
              >
                + Add Audio Track
              </button>
            </div>
            
            <div className="space-y-2">
              {timelineTracks.audio.map((track) => (
                <Track 
                  key={track.id}
                  trackId={track.id}
                  title={`Audio ${track.id.split('-').pop()}`}
                  type="audio"
                  clips={track.clips}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}