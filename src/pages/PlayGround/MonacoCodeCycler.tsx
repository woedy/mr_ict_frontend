import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const MonacoCodeTimelinePlayer = () => {
  // Sample code snippets with timestamps (in seconds)
  const codeTimelineData = [
    {
      timestamp: 0.0,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Basic Structure</title>
</head>
<body>
  
</body>
</html>`
    },
    {
      timestamp: 3.0,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Adding Header</title>
</head>
<body>
  <header>
    <h1>My Website</h1>
  </header>
</body>
</html>`
    },
    {
      timestamp: 7.0,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Adding Navigation</title>
</head>
<body>
  <header>
    <h1>My Website</h1>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
</body>
</html>`
    },
    {
      timestamp: 12.0,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Adding Main Content</title>
</head>
<body>
  <header>
    <h1>My Website</h1>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section>
      <h2>Welcome to our site</h2>
      <p>This is the main content area.</p>
    </section>
  </main>
</body>
</html>`
    },
    {
      timestamp: 18.0,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Adding Styles</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    header {
      background: #333;
      color: #fff;
      padding: 1rem;
    }
    nav ul {
      display: flex;
      list-style: none;
    }
    nav ul li {
      margin-right: 1rem;
    }
    nav a {
      color: #fff;
    }
    main {
      padding: 1rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>My Website</h1>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section>
      <h2>Welcome to our site</h2>
      <p>This is the main content area.</p>
    </section>
  </main>
</body>
</html>`
    },
    {
      timestamp: 25.0,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Complete Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    header {
      background: #333;
      color: #fff;
      padding: 1rem;
    }
    nav ul {
      display: flex;
      list-style: none;
    }
    nav ul li {
      margin-right: 1rem;
    }
    nav a {
      color: #fff;
    }
    main {
      padding: 1rem;
    }
    footer {
      background: #333;
      color: #fff;
      text-align: center;
      padding: 1rem;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>My Website</h1>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section>
      <h2>Welcome to our site</h2>
      <p>This is the main content area.</p>
      <p>Here you'll find all the information you need.</p>
    </section>
  </main>
  <footer>
    <p>&copy; 2025 My Website. All rights reserved.</p>
  </footer>
</body>
</html>`
    }
  ];

  // Find the total duration of the timeline
  const totalDuration = codeTimelineData[codeTimelineData.length - 1].timestamp;
  
  // State management
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCode, setCurrentCode] = useState(codeTimelineData[0].code);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Function to find the right code for the current time
  const updateCodeForTime = (time) => {
    // Find the last snippet that should be shown at the current time
    let appropriateSnippet = codeTimelineData[0];
    
    for (const snippet of codeTimelineData) {
      if (snippet.timestamp <= time) {
        appropriateSnippet = snippet;
      } else {
        break;
      }
    }
    
    setCurrentCode(appropriateSnippet.code);
  };

  // Animation loop
  const animate = (timestamp) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp - (lastTimeRef.current * 1000);
    }
    
    let currentElapsedTime = (timestamp - startTimeRef.current) / 1000;
    
    // Ensure we don't exceed the total duration
    if (currentElapsedTime > totalDuration) {
      currentElapsedTime = totalDuration;
      setIsPlaying(false);
    }
    
    setCurrentTime(currentElapsedTime);
    setProgress((currentElapsedTime / totalDuration) * 100);
    updateCodeForTime(currentElapsedTime);
    
    if (isPlaying && currentElapsedTime < totalDuration) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = currentTime;
      startTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  // Handle seeking in the timeline
  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * totalDuration;
    setCurrentTime(seekTime);
    setProgress((seekTime / totalDuration) * 100);
    updateCodeForTime(seekTime);
    lastTimeRef.current = seekTime;
    
    // Reset animation start time on manual seek
    if (isPlaying) {
      startTimeRef.current = null;
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Reset the player
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
    updateCodeForTime(0);
    lastTimeRef.current = 0;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-medium">HTML Code Timeline Player</h2>
          <div className="text-sm text-gray-400">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>
        
        <div className="h-96 border-b border-gray-200">
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
        
        <div className="bg-gray-100 px-4 py-3">
          {/* Progress bar / timeline */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          
          {/* Controls */}
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-3">
              <button 
                className={`px-4 py-2 rounded font-medium flex items-center ${isPlaying ? 'bg-gray-300 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                onClick={() => setIsPlaying(!isPlaying)}
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
              
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-medium flex items-center hover:bg-gray-400"
                onClick={handleReset}
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              {Math.round(currentTime * 10) / 10}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonacoCodeTimelinePlayer;