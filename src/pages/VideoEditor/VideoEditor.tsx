import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import axios from "axios";

function VideoEditor() {
  const [currentTime, setCurrentTime] = useState(0); // Current time in video
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [isCutting, setIsCutting] = useState(false); // Flag to track cutting
  const [cutRange, setCutRange] = useState({ start: 0, end: 0 }); // Cut range

  const totalVideoTime = 30; // Example total video time
  const videoPath = 'http://localhost:8000/media/recordings/recording_x264.mp4'; // Adjust your Django video URL here

  // Fetch code snippets from Django backend
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/snippets/")
      .then(response => {
        setCodeSnippets(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the code snippets:", error);
      });
  }, []);

  const handlePlay = (e) => {
    setCurrentTime(e.playedSeconds);
  };

  const handleToggleCutting = () => {
    setIsCutting(!isCutting);
    if (!isCutting) {
      setCutRange({ start: currentTime, end: currentTime });
    }
  };

  const handleSetEndCut = () => {
    setCutRange({ ...cutRange, end: currentTime });
  };

  const handleCutVideoAndCode = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/cut_video_and_code/", {
        start_time: cutRange.start,
        end_time: cutRange.end,
      });

      if (response.data.status === 'success') {
        alert('Video and code snippets cut successfully!');
        // You can handle the video URL and snippets here
        console.log('Cut video path:', response.data.cut_video_path);
        console.log('Code snippets:', response.data.snippets);
      } else {
        alert('There was an error cutting the video and code.');
      }
    } catch (error) {
      console.error("Error cutting video and code:", error);
      alert('Error cutting video and code.');
    }
  };

  return (
    <div className="flex flex-col items-center py-8">
      {/* Video Player */}
      <div className="w-full max-w-4xl mb-4">
        <h2 className="text-xl font-bold mb-2">Video Player</h2>
        <ReactPlayer
          url={videoPath}
          playing={true}
          controls={true}
          onProgress={handlePlay}
          width="100%"
        />
      </div>

      {/* Video Timeline */}
      <div className="w-full max-w-4xl mb-4">
        <h2 className="text-xl font-bold mb-2">Video Timeline</h2>
        <div className="relative w-full h-4 bg-gray-300 rounded">
          <div
            className="absolute top-0 left-0 h-4 bg-blue-500"
            style={{ width: `${(currentTime / totalVideoTime) * 100}%` }}
          />
          <div
            className="absolute top-0 left-0 h-6 w-1 bg-red-500"
            style={{ left: `${(currentTime / totalVideoTime) * 100}%` }}
          />
        </div>
      </div>

      {/* Code Snippet Timeline */}
      <div className="w-full max-w-4xl mb-4">
        <h2 className="text-xl font-bold mb-2">Code Snippet Timeline</h2>
        <div className="relative w-full h-4 bg-gray-300 rounded">
          {codeSnippets.map((snippet, index) => (
            <div
              key={index}
              className="absolute top-0 left-0 h-4 bg-green-500"
              style={{
                left: `${(snippet.timestamp / totalVideoTime) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Code Snippets Display */}
      <div className="w-full max-w-4xl mt-4">
        <h2 className="text-xl font-bold mb-2">Code Snippets</h2>
        {codeSnippets.map((snippet, index) => (
          <div key={index} className="p-4 mb-2 border rounded-lg shadow-sm bg-white">
            <p className="font-mono text-sm">{snippet.code_content}</p>
            <span className="text-gray-600 text-xs">{`Timestamp: ${snippet.timestamp}s`}</span>
          </div>
        ))}
      </div>

      {/* Editing Tools */}
      <div className="flex space-x-4 mt-8">
        <button
          className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-700"
          onClick={handleToggleCutting}
        >
          {isCutting ? "Cancel Cut" : "Start Cut"}
        </button>
        {isCutting && (
          <button
            className="px-6 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-700"
            onClick={handleSetEndCut}
          >
            End Cut
          </button>
        )}
        <button
          className="px-6 py-2 text-white bg-green-500 rounded-lg hover:bg-green-700"
          onClick={handleCutVideoAndCode}
        >
          Cut Video & Code
        </button>
      </div>
    </div>
  );
}

export default VideoEditor;
