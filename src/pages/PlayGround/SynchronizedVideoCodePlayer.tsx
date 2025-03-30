import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const SynchronizedVideoCodePlayer = () => {


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
    const videoRef = useRef(null);
    const requestAnimationRef = useRef(null);
    
    // Fetch data from server
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Replace with your actual API endpoint
                const response = await axios.get('http://localhost:8000/api/tutorial/');
                
                setVideoUrl("http://localhost:8000" + response.data.data.video_url);
                
                // Sort code snippets by timestamp to ensure proper sequencing
                const sortedSnippets = [...response.data.data.code_snippets].sort((a, b) => a.timestamp - b.timestamp);
                setCodeTimelineData(sortedSnippets);
                
                // Set initial code to the first snippet
                if (sortedSnippets.length > 0) {
                    setCurrentCode(sortedSnippets[0].code_content);
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
                        .catch(err => {
                            // Playback failed
                            setVideoError(`Failed to play video: ${err.message}`);
                            setIsPlaying(false);
                            console.error("Video playback error:", err);
                        });
                }
            }
            
            setIsPlaying(!isPlaying);
        } catch (err) {
            setVideoError(`Error controlling video: ${err.message}`);
            console.error("Video control error:", err);
        }
    };
    
    // Handle seeking in the video
    const handleSeek = (e) => {
        if (!videoRef.current) return;
        
        const seekTime = parseFloat(e.target.value);
        videoRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
        
        // Immediately update code to match the new position
        syncCodeWithTime(seekTime);
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
    
    // Handle video can play event
    const handleCanPlay = () => {
        setCanPlay(true);
        setVideoError(null);
        
        // Initial sync on load
        syncCodeWithTime(videoRef.current.currentTime);
    };
    
    // Handle video error
    const handleVideoError = (e) => {
        const video = videoRef.current;
        let errorMessage = "Unknown video error";
        
        if (video && video.error) {
            switch (video.error.code) {
                case 1:
                    errorMessage = "Video loading aborted";
                    break;
                case 2:
                    errorMessage = "Network error, check your connection";
                    break;
                case 3:
                    errorMessage = "Video decoding failed - format may not be supported";
                    break;
                case 4:
                    errorMessage = "Video not found or access denied";
                    break;
                default:
                    errorMessage = `Video error: ${video.error.message}`;
            }
        }
        
        setVideoError(errorMessage);
        setCanPlay(false);
        console.error("Video error:", errorMessage);
    };
    
    // Format time as MM:SS
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds === null || seconds === undefined) return "00:00";
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-4 flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading tutorial...</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="w-full max-w-6xl mx-auto p-4 flex items-center justify-center h-64">
                <div className="text-lg text-red-600">{error}</div>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-3">
                    <h2 className="text-white font-medium text-xl">Interactive Coding Tutorial</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 p-4">
                    {/* Video Player */}
                    <div className="flex flex-col">
                        <div className="w-full bg-black rounded overflow-hidden relative">
                            {videoError && (
                                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                                    <div className="text-white text-center">
                                        <p className="font-medium mb-2">Video Error</p>
                                        <p className="text-sm">{videoError}</p>
                                        <p className="text-xs mt-2">Try a different browser or check the video format</p>
                                    </div>
                                </div>
                            )}
                            <video
                                ref={videoRef}
                                className="w-full"
                                src={videoUrl}
                                onPlay={handleVideoPlay}
                                onPause={handleVideoPause}
                                onEnded={handleVideoEnded}
                                onCanPlay={handleCanPlay}
                                onError={handleVideoError}
                                controls={false}
                                playsInline
                                preload="auto" // Changed from "metadata" to "auto" for better loading
                            >
                                Your browser does not support the video tag.
                                <source src={videoUrl} type="video/mp4" />
                                <source src={videoUrl} type="video/webm" />
                                <source src={videoUrl} type="video/ogg" />
                            </video>
                        </div>
                        
                        {/* Video Controls */}
                        <div className="bg-gray-100 p-3 rounded mt-3">
                            {/* Progress bar / timeline */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                    {formatTime(currentTime)}
                                </span>
                                <input
                                    type="range"
                                    min="0"
                                    max={videoRef.current?.duration || 100}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                    disabled={!canPlay}
                                    step="0.01" // Add fine-grained control
                                />
                                <span className="text-sm text-gray-600">
                                    {formatTime(videoRef.current?.duration || 0)}
                                </span>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex justify-center mt-3">
                                <button 
                                    className={`px-4 py-2 rounded font-medium flex items-center ${!canPlay ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isPlaying ? 'bg-gray-300 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    onClick={togglePlayPause}
                                    disabled={!canPlay}
                                >
                                    {isPlaying ? (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                            Play
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {videoError && (
                                <div className="mt-2 text-xs text-center text-red-600">
                                    <button 
                                        className="underline hover:text-red-800"
                                        onClick={() => {
                                            if (videoRef.current) {
                                                videoRef.current.load(); // Reload the video element
                                                setVideoError(null);
                                            }
                                        }}
                                    >
                                        Try reloading the video
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Code Editor */}
                    <div className="flex flex-col">
                        <div className="h-80 border border-gray-200 rounded">
                            <Editor
                                height="100%"
                                language="html"
                                value={currentCode}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    automaticLayout: true,
                                    readOnly: true
                                }}
                            />
                        </div>
                        
                        <div className="bg-gray-100 p-3 rounded mt-3">
                            <h3 className="font-medium text-gray-700">Code Timeline</h3>
                            <div className="mt-2 max-h-32 overflow-y-auto">
                                {codeTimelineData.map((snippet, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-2 rounded cursor-pointer mb-1 ${snippet.timestamp <= currentTime && (index === codeTimelineData.length - 1 || codeTimelineData[index + 1].timestamp > currentTime) ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50 hover:bg-gray-200'}`}
                                        onClick={() => {
                                            if (videoRef.current && canPlay) {
                                                videoRef.current.currentTime = snippet.timestamp;
                                                setCurrentTime(snippet.timestamp);
                                                syncCodeWithTime(snippet.timestamp);
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-medium">{snippet.title || `Snippet ${index + 1}`}</span>
                                            <span className="text-sm text-gray-600">{formatTime(snippet.timestamp)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{snippet.description || 'Code update'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SynchronizedVideoCodePlayer;