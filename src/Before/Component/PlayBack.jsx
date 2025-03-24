import React, { useState, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import api from '../services/api';

const PlaybackViewer = ({ recordingId }) => {
  const [recording, setRecording] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef(null);
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  
  // Load recording and snapshots
  useEffect(() => {
    const loadData = async () => {
      try {
        const recordingData = await api.getRecording(recordingId);
        const snapshotsData = await api.getCodeSnapshots(recordingId);
        
        setRecording(recordingData);
        setSnapshots(snapshotsData);
      } catch (error) {
        console.error('Failed to load recording:', error);
      }
    };
    
    if (recordingId) {
      loadData();
    }
  }, [recordingId]);
  
  // Initialize Monaco editor
  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: '// Code will appear here during playback',
        language: 'javascript',
        theme: 'vs-dark',
        readOnly: true,
        automaticLayout: true
      });
    }
    
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);
  
  // Update code based on video time
  useEffect(() => {
    if (!snapshots.length || !editorRef.current) return;
    
    // Find the snapshot that matches the current time
    const currentSnapshot = snapshots.reduce((prev, current) => {
      return (current.timestamp <= currentTime && 
              current.timestamp > prev.timestamp) ? current : prev;
    }, { timestamp: -1 });
    
    // If we found a valid snapshot, update the editor
    if (currentSnapshot.timestamp >= 0) {
      editorRef.current.setValue(currentSnapshot.code_content);
      
      // Set cursor and scroll position if available
      if (currentSnapshot.cursor_position) {
        editorRef.current.setPosition(currentSnapshot.cursor_position);
      }
      
      if (currentSnapshot.scroll_position) {
        editorRef.current.setScrollTop(currentSnapshot.scroll_position);
      }
    }
  }, [currentTime, snapshots]);
  
  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Play/pause video
  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  if (!recording) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{recording.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Video</h2>
          <video 
            ref={videoRef}
            src={recording.video_file}
            className="w-full rounded"
            onTimeUpdate={handleTimeUpdate}
            controls
          />
        </div>
        
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Code</h2>
          <div 
            ref={containerRef} 
            className="flex-grow border rounded" 
            style={{ height: '400px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaybackViewer;