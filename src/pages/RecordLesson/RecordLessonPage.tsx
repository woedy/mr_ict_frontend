// src/App.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import RecStatusBar from './Editor/RecStatus';
import RecEditor from './Editor/RecEditor';
import RecSidebar from './Editor/RecSideBar';
import RecHeader from './Editor/RecHeader';
import axios from 'axios'; // Axios for making HTTP requests
import RecDraggableWindow from './Components/RecDraggableWindow';
import Uploading from './Components/Uploading';

const RecordLessonPage = () => {
  const [permissionError, setPermissionError] = useState(false);

  // ScreenRecorder
  const startTimeRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isScreenRecordingStarted, setIsScreenRecordingStarted] =
    useState(false); // Track when screen recording has actually started

  const [recordingTitle, setRecordingTitle] = useState('New Recording');
  const [recordingDescription, setRecordingDescription] = useState('');

  const getCurrentTimestamp = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return (Date.now() - startTimeRef.current) / 1000; // Convert to seconds
  }, []);

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
            const blob = new Blob(recordedChunksRef.current, {
              type: 'video/webm',
            });
            const videoUrl = URL.createObjectURL(blob);
            //videoRef.current.src = videoUrl;
            sendVideoToServer(blob);
            recordedChunksRef.current = []; // Clear recorded chunks after sending
          };

          mediaRecorder.start();
          setIsScreenRecordingStarted(true); // Screen recording has started
          setPermissionError(false); // Reset any previous error
          setIsRecording(true);
          console.log(startTimeRef.current);
          startTimeRef.current = Date.now();
          console.log(startTimeRef.current);
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
        startTimeRef.current = getCurrentTimestamp();
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
    setIsUploading(true);

    try {
      //console.log(startTimeRef.current);
      const formData = new FormData();
      formData.append('video_file', blob, 'recording.webm');
      formData.append('title', recordingTitle);
      formData.append('description', recordingDescription);
      formData.append('duration', startTimeRef.current);

      const response = await axios.post(
        'http://localhost:8000/api/upload/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      console.log('Video uploaded successfully:', response.data);
      setIsUploading(false);
      setRecordingDescription('')
    } catch (err) {
      console.error('Error uploading video:', err);
      setIsUploading(false);
    }
  };

  const handleStartRecording = async () => {
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {permissionError && (
        <div className="text-red-500 mt-4">
          <p>
            Permission denied or screen sharing is not supported in this
            browser. Please allow access to your screen.
          </p>
        </div>
      )}

      <div className="flex space-x-4">
        {!isRecording ? (
          <>
            <div className="flex space-x-4 m-4">
              <input
                type="text"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Recording Title"
              />

              <input
                type="text"
                value={recordingDescription}
                onChange={(e) => setRecordingDescription(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description"
              />
            </div>
          </>
        ) : (
          <div></div>
        )}
      </div>

      <RecHeader
        isRecording={isRecording && isScreenRecordingStarted}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        isUploading={isUploading}
      />
      <div className="flex flex-1">
        <RecSidebar />
        <RecEditor
          isRecording={isRecording && isScreenRecordingStarted}
          title={recordingTitle}
          getCurrentTimestamp={getCurrentTimestamp}
        />
      </div>
      <RecStatusBar />
      <RecDraggableWindow />
      {isUploading && <Uploading />}
    </div>
  );
};

export default RecordLessonPage;
