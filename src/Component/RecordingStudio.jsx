import React, { useState, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { startRecording, stopRecording } from '../utils/screenRecorder';
import api from '../services/api';

const RecordingStudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTitle, setRecordingTitle] = useState('New Recording');
  const [isUploading, setIsUploading] = useState(false);
  
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const snapshotBuffer = useRef([]);
  const lastUploadTime = useRef(Date.now());
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const handleStartRecording = async () => {
    try {
      // Create a new recording in the database
      const recordingData = await api.createRecording({ 
        title: recordingTitle,
        description: 'Recording started on ' + new Date().toLocaleString() 
      });
      setRecordingId(recordingData.id);
      
      // Start the screen/audio recording
      const recorder = await startRecording();
      recorderRef.current = recorder;
      
      // Start timer for tracking timestamps
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 0.1);
      }, 100);
      
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please make sure you have granted screen sharing permissions.');
    }
  };
  
  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    
    clearInterval(timerRef.current);
    setIsUploading(true);
    
    try {
      // Get the recorded video blob
      const videoBlob = await stopRecording(recorderRef.current);
      
      // Upload any remaining snapshots
      await uploadSnapshotBatch();
      
      // Upload the video file to the server
      const formData = new FormData();
      formData.append('video_file', videoBlob, 'recording.webm');
      formData.append('duration', recordingTime.toString());
      
      await api.updateRecording(recordingId, formData);
      
      setIsRecording(false);
      setIsUploading(false);
      alert('Recording saved successfully!');
      
      // Reset state for a new recording
      setRecordingTime(0);
      setRecordingTitle('New Recording');
      setRecordingId(null);
    } catch (error) {
      console.error('Failed to save recording:', error);
      setIsUploading(false);
      alert('Failed to save recording. Please try again.');
    }
  };
  
  const handleCodeSnapshot = (codeData) => {
    if (!isRecording || !recordingId) return;
    
    // Add to buffer
    snapshotBuffer.current.push({
      recording: recordingId,
      timestamp: recordingTime,
      code_content: codeData.content,
      cursor_position: codeData.cursorPosition,
      scroll_position: codeData.scrollPosition,
      is_highlight: codeData.isHighlight || false
    });
    
    // Check if we should upload batch (30 seconds passed or buffer getting large)
    if (Date.now() - lastUploadTime.current > 30000 || snapshotBuffer.current.length > 20) {
      uploadSnapshotBatch();
    }
  };
  
  const uploadSnapshotBatch = async () => {
    if (snapshotBuffer.current.length === 0) return;
    
    // Clone the buffer but don't clear it yet
    const batchToUpload = [...snapshotBuffer.current];
    
    try {
      // Upload the batch
      await api.createCodeSnapshotBatch(batchToUpload);
      
      // Only clear the buffer after successful upload
      snapshotBuffer.current = snapshotBuffer.current.filter(
        snapshot => !batchToUpload.includes(snapshot)
      );
      lastUploadTime.current = Date.now();
    } catch (error) {
      console.error('Failed to upload snapshots:', error);
      // No need to put items back since we never removed them
    }
  };


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Recording Studio</h1>
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
              <button 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" 
                onClick={handleStartRecording}
              >
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
      </div>
      
      {isRecording && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4 flex items-center">
          <div className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></div>
          Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toFixed(1).padStart(4, '0')}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Screen Preview</h2>
          <div className="bg-gray-200 h-64 rounded flex items-center justify-center">
            {isRecording ? (
              <p>Screen is being recorded</p>
            ) : (
              <p>Press "Start Recording" to begin</p>
            )}
          </div>
        </div>
        

      </div>
    </div>
  );
};

export default RecordingStudio;