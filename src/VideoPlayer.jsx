import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [editorCode, setEditorCode] = useState('// Write your code here');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
        setIsVideoLoaded(true);
      }
    };

    const updateTime = () => {
      if (video.duration && isFinite(video.duration)) {
        setCurrentTime(video.currentTime);
        setSeekValue((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', updateTime);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', updateTime);
    };
  }, [videoUrl]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Error playing video:', error);
          setIsPlaying(false);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const value = e.target.value;
    setSeekValue(value);
    video.currentTime = (value / 100) * video.duration;
  };

  const handleEditorChange = (value) => {
    setEditorCode(value);
  };

  return (
    <div className="relative w-full h-screen flex flex-col">
      {/* Content Area */}
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex">
          {/* Video Container */}
          <div className={`w-full h-full ${!isPlaying ? 'opacity-30' : ''}`}>
            <video 
              ref={videoRef}
              className="w-full h-full object-cover" 
              src={videoUrl} 
              onClick={handlePlayPause}
              playsInline
              muted
            />
          </div>

          {/* Editor Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={editorCode}
                onChange={handleEditorChange}
                theme="vs-dark"
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls - Always Visible */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between p-4 bg-black bg-opacity-50 z-10"> 
        {/* Play/Pause Button */}
        <button 
          className="text-white text-2xl" 
          onClick={handlePlayPause}
          disabled={!isVideoLoaded}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Seek Bar Container */}
        <div className="flex-1 mx-4 flex items-center space-x-2">
          {/* Current Time */}
          <span className="text-white text-sm">
            {formatTime(currentTime)}
          </span>

          {/* Seek Bar */}
          <div className="flex-1">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={seekValue} 
              onChange={handleSeek}
              className="w-full h-2 bg-gray-400 rounded-full appearance-none cursor-pointer"
              style={{ 
                background: `linear-gradient(to right, #4caf50 ${seekValue}%, #808080 ${seekValue}%)`,
              }}
              disabled={!isVideoLoaded}
            />
          </div>

          {/* Total Duration */}
          <span className="text-white text-sm">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;