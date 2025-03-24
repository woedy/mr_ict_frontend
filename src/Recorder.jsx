import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; // Axios for making HTTP requests
import CodeEditor from './Editor';

const ScreenRecorder = ({}) => {
  const [permissionError, setPermissionError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenRecordingStarted, setIsScreenRecordingStarted] = useState(false); // Track when screen recording has actually started
  const [recordingTitle, setRecordingTitle] = useState('New Recording');
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      const startRecording = async () => {
        try {
          // Get access to the user's screen
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'screen', cursor: 'always' },
          });

          // Get access to the user's microphone
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // Combine both video (screen) and audio (microphone) streams
          const combinedStream = new MediaStream([
            ...screenStream.getTracks(),
            ...audioStream.getTracks(),
          ]);

          mediaStreamRef.current = combinedStream; // Save the combined stream for later use

          // Initialize MediaRecorder with the combined stream
          const mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm',
          });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data); // Store chunks in ref
            }
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(blob);
            videoRef.current.src = videoUrl;
            sendVideoToServer(blob);
            recordedChunksRef.current = []; // Clear recorded chunks after sending
          };

          mediaRecorder.start();
          setIsScreenRecordingStarted(true); // Screen recording has started
          setPermissionError(false); // Reset any previous error
          setIsRecording(true);
        } catch (err) {
          console.error('Error starting recording:', err);
          setPermissionError(true);
          setIsRecording(false);
        }
      };

      startRecording();
    } else {
      const stopRecording = () => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop(); // Stop the recorder
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop()); // Stop all media tracks
        }
        setIsRecording(false);
      };

      stopRecording();
    }

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  const sendVideoToServer = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('video_file', blob, 'recording.webm');

      const response = await axios.post('http://localhost:8000/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Video uploaded successfully:', response.data);
    } catch (err) {
      console.error('Error uploading video:', err);
    }
  };

  const handleStartRecording = async () => {
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col items-center p-4 space-y-4">
          {permissionError && (
            <div className="text-red-500 mt-4">
              <p>Permission denied or screen sharing is not supported in this browser. Please allow access to your screen.</p>
            </div>
          )}

          <div className="flex space-x-2">
            {!isRecording ? (
              <>
                <input
                  type="text"
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                  className="border rounded px-3 py-2"
                  placeholder="Recording Title"
                />
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onClick={handleStartRecording}>
                  Start Recording
                </button>
              </>
            ) : (
              <button
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
                onClick={handleStopRecording}
                disabled={isUploading}
              >
                {isUploading ? 'Saving...' : 'Stop Recording'}
              </button>
            )}
          </div>

          <div>
            <video ref={videoRef} controls className="mt-4 border rounded-lg" width="400"></video>
          </div>
        </div>

        <CodeEditor isRecording={isRecording && isScreenRecordingStarted} />
      </div>
    </>
  );
};

export default ScreenRecorder;
