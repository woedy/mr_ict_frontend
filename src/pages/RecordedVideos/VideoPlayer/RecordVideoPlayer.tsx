import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Link } from 'react-router-dom';
import Logo from '../../../images/logo/coat.png';
import axios from 'axios';
import RecDraggableWindow from '../../RecordLesson/Components/RecDraggableWindow';
import DraggableVideoWindow from '../Components/DraggableVideoWindow';
import TutorialPage from './Editor/TutorialPage';

const RecordVideoPlayer = () => {
  // State for video and code data
  const [videoUrl, setVideoUrl] = useState('');
  const [codeTimelineData, setCodeTimelineData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(null);

  // Player state
  const [currentCode, setCurrentCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const requestAnimationRef = useRef(null);

  // HTML Preview state
  const [htmlOutput, setHtmlOutput] = useState('');
  const [showPreviewWindow, setShowPreviewWindow] = useState(true);
  const [editedCode, setEditedCode] = useState('');


  const [isSeeking, setIsSeeking] = useState(false); // Add isSeeking state

  // Fetch data from server
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint
        const response = await axios.get('http://localhost:8000/api/tutorial/');

        setVideoUrl('http://localhost:8000' + response.data.data.video_url);

        // Sort code snippets by timestamp to ensure proper sequencing
        const sortedSnippets = [...response.data.data.code_snippets].sort(
          (a, b) => a.timestamp - b.timestamp,
        );
        setCodeTimelineData(sortedSnippets);

        // Set initial code to the first snippet
        if (sortedSnippets.length > 0) {
          setCurrentCode(sortedSnippets[0].code_content);
          setHtmlOutput(sortedSnippets[0].code_content); // Set initial HTML output
          setEditedCode(sortedSnippets[0].code_content);
        }

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load tutorial data');
        setIsLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // Update HTML output when current code changes
  useEffect(() => {
    // Assuming currentCode contains HTML code
    setHtmlOutput(currentCode);
  }, [currentCode]);

  // Handle code synchronization based on current time
  const syncCodeWithTime = (time) => {
    if (!codeTimelineData.length) return;

    // Find the appropriate code snippet for the current time
    let appropriateSnippet = codeTimelineData[0];

    for (let i = 0; i < codeTimelineData.length; i++) {
      const snippet = codeTimelineData[i];
      if (snippet.timestamp <= time) {
        appropriateSnippet = snippet;
      } else {
        break;
      }
    }

    setCurrentCode(appropriateSnippet.code_content);
    setEditedCode(appropriateSnippet.code_content);
  };

  // Animation frame loop for smooth time tracking
  const updateTimeDisplay = () => {
    if (videoRef.current && isPlaying) {
      const newTime = videoRef.current.currentTime;
      setCurrentTime(newTime);
      syncCodeWithTime(newTime);
      requestAnimationRef.current = requestAnimationFrame(updateTimeDisplay);
    }
  };

  // Start and stop the animation frame loop based on play state
  useEffect(() => {
    if (isPlaying) {
      requestAnimationRef.current = requestAnimationFrame(updateTimeDisplay);
    } else if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
    }

    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [isPlaying, codeTimelineData]);

  // Handle play/pause for both video and code
  const togglePlayPause = () => {
    if (!videoRef.current || !canPlay) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Important: Sync code before starting playback
        syncCodeWithTime(videoRef.current.currentTime);

        const playPromise = videoRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
              setVideoError(null);
            })
            .catch((err) => {
              // Playback failed
              setVideoError(`Failed to play video: ${err.message}`);
              setIsPlaying(false);
              console.error('Video playback error:', err);
            });
        }
      }

      setIsPlaying(!isPlaying);
    } catch (err) {
      setVideoError(`Error controlling video: ${err.message}`);
      console.error('Video control error:', err);
    }
  };

  // Handle seeking in the video
  // Handle seeking in the video
  const handleSeek = (e) => {
    if (!videoRef.current) return;

    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    syncCodeWithTime(seekTime);
    setIsSeeking(true); // Set seeking flag to true
  };

  // Sync play/pause state with video events
  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  // Handle video duration update
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle timeupdate event to keep UI in sync with video position
  const handleTimeUpdate = () => {
    if (videoRef.current && !isPlaying && !isSeeking) {
      setCurrentTime(videoRef.current.currentTime);
      syncCodeWithTime(videoRef.current.currentTime);
    }
    if (isSeeking && Math.abs(videoRef.current.currentTime - currentTime) <0.1){
        setIsSeeking(false);
    }
  };

  // Handle video can play event
  const handleCanPlay = () => {
    setCanPlay(true);
    setVideoError(null);

    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }

    // Initial sync on load
    syncCodeWithTime(videoRef.current?.currentTime || 0);
  };

  // Handle video error
  const handleVideoError = (e) => {
    const video = videoRef.current;
    let errorMessage = 'Unknown video error';

    if (video && video.error) {
      switch (video.error.code) {
        case 1:
          errorMessage = 'Video loading aborted';
          break;
        case 2:
          errorMessage = 'Network error, check your connection';
          break;
        case 3:
          errorMessage = 'Video decoding failed - format may not be supported';
          break;
        case 4:
          errorMessage = 'Video not found or access denied';
          break;
        default:
          errorMessage = `Video error: ${video.error.message}`;
      }
    }

    setVideoError(errorMessage);
    setCanPlay(false);
    console.error('Video error:', errorMessage);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null || seconds === undefined)
      return '00:00';
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Calculate seek bar gradient percentage
  const calculateSeekPercentage = () => {
    if (duration <= 0) return 0;
    return (currentTime / duration) * 100;
  };

  // Add a pause function
  const pauseVideo = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleCodeChange = (newCode) => {
    setEditedCode(newCode);
  };

  const runCode = () => {
    setHtmlOutput(editedCode);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-lg text-gray-600">Loading tutorial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header - Fixed at top */}
      <header className="bg-primary text-white p-3 flex justify-between items-center absolute top-0 left-0 right-0 z-20">
        {/* Left Section: Logo and course info */}
        <div className="flex items-center space-x-4">
          <Link to={'/dashboard'}>
            <img className="h-10" src={Logo} alt="Logo" />
          </Link>
        </div>
      </header>

      {/* Main content area - Fills available space */}
      <div className="flex-grow relative overflow-hidden">
        {/* Video container */}
        <div className="absolute inset-0 translate-y-[-24px]">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={videoUrl}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onEnded={handleVideoEnded}
            onCanPlay={handleCanPlay}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onError={handleVideoError}
            controls={false}
            playsInline
            preload="auto"
          >
            Your browser does not support the video tag.
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
          </video>
        </div>

        {/* Video error overlay */}
        {videoError && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-30">
            <div className="text-white text-center">
              <p className="font-medium mb-2">Video Error</p>
              <p className="text-sm">{videoError}</p>
              <p className="text-xs mt-2">
                Try a different browser or check the video format
              </p>
              <button
                className="mt-3 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.load(); // Reload the video element
                    setVideoError(null);
                  }
                }}
              >
                Try reloading
              </button>
            </div>
          </div>
        )}

        {/* Editor overlay */}
        <div
          className={`absolute inset-0 z-20 ${
            isPlaying ? 'opacity-25' : 'opacity-100'
          } transition-opacity duration-300`}
        >
          <TutorialPage
            value={editedCode}
            onEditorInteraction={pauseVideo}
            onCodeChange={handleCodeChange}
          />
        </div>
      </div>

      {/* Controls - Fixed at bottom */}
      <div className="bg-black bg-opacity-50 px-2 py-1 flex items-center space-x-4 z-30 relative">
        {/* Play/Pause Button */}
        <button
          className={`px-4 py-1 rounded font-medium text-xs flex items-center ${
            !canPlay
              ? 'bg-white text-white cursor-not-allowed'
              : isPlaying
              ? 'bg-green text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={togglePlayPause}
          disabled={!canPlay}
        >
          {isPlaying ? (
            <>
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Play
            </>
          )}
        </button>

        {/* Seek Bar Container */}
        <div className="flex-1 flex items-center space-x-2">
          {/* Current Time */}
          <span className="text-white text-xs">{formatTime(currentTime)}</span>

          {/* Seek Bar */}
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-400 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #4caf50 ${calculateSeekPercentage()}%, #808080 ${calculateSeekPercentage()}%)`,
              }}
              disabled={!canPlay}
              step="0.01"
            />
          </div>

          {/* Total Duration */}
          <span className="text-white text-xs">{formatTime(duration)}</span>
        </div>

        {/* Run Code Button */}
        <button
          className="px-4 py-2 rounded text-xs font-medium flex items-center bg-green-600 text-white hover:bg-green-700"
          onClick={runCode}
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Run
        </button>

        {/* Preview Toggle Button */}
        <button
          className="px-4 py-1 rounded font-medium text-xs flex items-center bg-slate-50 text-gray-700 hover:bg-gray-400"
          onClick={() => setShowPreviewWindow(!showPreviewWindow)}
        >
          {showPreviewWindow ? 'Hide Preview' : 'Show Preview'}
        </button>

        {/* Keep DraggableVideoWindow */}
        <DraggableVideoWindow video={videoUrl} /> 
      </div>

      {/* HTML Preview Window */}
      {showPreviewWindow && (
        <div className="absolute z-30">
          <RecDraggableWindow htmlContent={htmlOutput} title="HTML Preview" />
        </div>
      )}
    </div>
  );
};

export default RecordVideoPlayer;