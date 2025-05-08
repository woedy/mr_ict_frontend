import { useRef, useEffect, useState, useMemo } from 'react';
import useEditorStore from './_store/editorStore';
import Track from './Track';

export default function Timeline({ videoRef, duration }) {
  const { 
    timelineTracks, 
    zoom, 
    currentTime, 
    setCurrentTime, 
    addTrack, 
    setZoom 
  } = useEditorStore();
  
  const timelineRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Add zoom levels
  const zoomLevels = [5, 10, 15, 20, 30, 40, 50, 60, 80, 100];

  const maxDuration = useMemo(() => {
    let max = duration || 0;
    
    // Find the end time of the latest clip in any track
    Object.keys(timelineTracks).forEach((mediaType) => {
      timelineTracks[mediaType].forEach((track) => {
        track.clips.forEach((clip) => {
          const clipEnd = clip.startTime + clip.duration;
          if (clipEnd > max) max = clipEnd;
        });
      });
    });
    
    return Math.max(max + 10, 30); // Extra padding for scroll
  }, [timelineTracks, duration]);

  const timelineWidth = maxDuration * zoom;
  const playheadPosition = currentTime * zoom;
  
  // Generate time markers based on zoom level
  const timeMarkers = useMemo(() => {
    const markers = [];
    const interval = zoom < 20 ? 5 : zoom < 40 ? 1 : 0.5; // Adjust marker interval based on zoom
    
    for (let i = 0; i <= maxDuration; i += interval) {
      markers.push({
        time: i,
        position: i * zoom,
        label: formatTime(i),
        major: i % (interval * 5) === 0, // Every 5th marker is major
      });
    }
    
    return markers;
  }, [zoom, maxDuration]);
  
  // Format time as MM:SS or MM:SS.s
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (zoom < 30) {
      return `${mins}:${secs.toFixed(0).padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
    }
  }

  const updateTimeFromEvent = (e) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(x / zoom, maxDuration));
    setCurrentTime(newTime);

    if (videoRef?.current) videoRef.current.currentTime = newTime;
  };

  const handleMouseDown = (e) => {
    if (e.target === timelineRef.current || e.target.classList.contains('timeline-track') || 
        e.target.classList.contains('time-ruler')) {
      setIsDragging(true);
      updateTimeFromEvent(e);
    }
  };
  
  // Auto-scroll to playhead
  useEffect(() => {
    if (!timelineContainerRef.current) return;
    
    const container = timelineContainerRef.current;
    const playheadPos = currentTime * zoom;
    
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    
    // If playhead is outside visible area, scroll to it
    if (playheadPos < scrollLeft || playheadPos > scrollLeft + containerWidth - 100) {
      container.scrollLeft = playheadPos - containerWidth / 2;
    }
  }, [currentTime, zoom]);

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
  
  // Keyboard shortcuts for playback control
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'k') {
        // Toggle play/pause
        togglePlayPause();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        // Jump backward
        setCurrentTime(Math.max(0, currentTime - (e.shiftKey ? 5 : 1)));
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        // Jump forward
        setCurrentTime(currentTime + (e.shiftKey ? 5 : 1));
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime]);
  
  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef?.current?.pause();
    
    } else {
      videoRef?.current?.play();
    
    }
    setIsPlaying(!isPlaying);
  };
  
  // Add zoom handlers
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };
  
  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-2 bg-bodydark2 border-b">
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 rounded bg-gray-200 hover:bg-gray"
            onClick={handleZoomOut}
            disabled={zoom === zoomLevels[0]}
          >
            <span className="text-lg">−</span>
          </button>
          
          <div className="text-sm font-medium">
            {zoom}px/s
          </div>
          
          <button 
            className="p-1 rounded bg-gray-200 hover:bg-gray"
            onClick={handleZoomIn}
            disabled={zoom === zoomLevels[zoomLevels.length - 1]}
          >
            <span className="text-lg">+</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={togglePlayPause}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <div className="text-sm font-mono">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
      
      {/* Time ruler */}
      <div className="relative h-6 bg-gray-100 border-b overflow-hidden">
        <div 
          className="absolute left-0 right-0 time-ruler"
          style={{ width: `${timelineWidth}px` }}
        >
          {timeMarkers.map((marker) => (
            <div 
              key={marker.time} 
              className={`absolute h-${marker.major ? '6' : '3'} border-l ${marker.major ? 'border-gray-400' : 'border-gray-300'}`}
              style={{ left: `${marker.position}px` }}
            >
              {marker.major && (
                <div className="absolute -left-[10px] top-1 text-[10px] text-gray-500">
                  {marker.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div 
        ref={timelineContainerRef}
        className="relative overflow-x-auto"
        style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      >
        <div
          ref={timelineRef}
          className="relative bg-gray"
          style={{ width: `${timelineWidth}px`, minWidth: '100%' }}
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
          
          {/* Add vertical grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {timeMarkers.filter(m => m.major).map((marker) => (
              <div 
                key={marker.time} 
                className="absolute top-0 bottom-0 border-l border-graydark"
                style={{ left: `${marker.position}px` }}
              />
            ))}
          </div>

          <div className="p-2 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Video Tracks</h3>
                <button
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
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
                {timelineTracks.video.length === 0 && (
                  <div className="h-16 border rounded border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    No video tracks. Click "+ Add Video Track" to create one.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Audio Tracks</h3>
                <button
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
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
                {timelineTracks.audio.length === 0 && (
                  <div className="h-16 border rounded border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    No audio tracks. Click "+ Add Audio Track" to create one.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}