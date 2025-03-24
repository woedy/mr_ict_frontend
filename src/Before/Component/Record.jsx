import React, { useState, useRef } from 'react';
import axios from 'axios'; // Axios for making HTTP requests

const ScreenRecorder2 = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const recordedChunksRef = useRef([]); // Using ref to store chunks
  const mediaStreamRef = useRef(null); // To store the media stream

  // Request screen recording permission and start recording
  const startRecording = async () => {
    try {
      // Get access to the user's screen
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          mediaSource: 'screen',
          cursor: 'always'
        },
      });

      // Get access to the user's microphone
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true, // Request microphone access
      });

      // Combine both video (screen) and audio (microphone) streams
      const combinedStream = new MediaStream([
        ...screenStream.getTracks(),
        ...audioStream.getTracks(),
      ]);

      mediaStreamRef.current = combinedStream; // Save the combined stream for later use

      // Initialize MediaRecorder with the combined stream
      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;

      // Collect data chunks when available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data); // Store chunks in ref
        }
      };

      // When the recording stops, create a Blob from the recorded chunks and send to server
      mediaRecorder.onstop = () => {
        // Create a Blob from the recorded chunks
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        videoRef.current.src = videoUrl;

        // Send the recording to the Django server
        sendVideoToServer(blob);

        // Clear recorded chunks after sending
        recordedChunksRef.current = [];
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setPermissionError(false); // Reset any previous error

    } catch (err) {
      console.error("Error starting recording:", err);
      setPermissionError(true); // Set error if permission is denied or another issue occurs
    }
  };

  // Stop the recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // Stop the recorder
    }

    // Stop the media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop()); // Stop all media tracks
    }

    setIsRecording(false);
  };

  // Function to send video file to the Django server
  const sendVideoToServer = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('video_file', blob, 'recording.webm'); // Append the video blob to FormData

      // Send a POST request with the video file to the Django server
      const response = await axios.post('http://localhost:8000/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Tell server we're sending form data
        },
      });

      console.log('Video uploaded successfully:', response.data);
    } catch (err) {
      console.error('Error uploading video:', err);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="space-x-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {/* Show error message if permission is denied */}
      {permissionError && (
        <div className="text-red-500 mt-4">
          <p>Permission denied or screen sharing is not supported in this browser. Please allow access to your screen.</p>
        </div>
      )}

      {/* Video element to display the recording */}
      <div>
        <video
          ref={videoRef}
          controls
          className="mt-4 border rounded-lg"
          width="400"
        ></video>
      </div>
    </div>
  );
};

export default ScreenRecorder2;
