import React, { useRef, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor';

const CodeEditor = ({ isRecording, onCodeSnapshot, snapshotInterval = 5000 }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Define captureSnapshot with useCallback to avoid dependency issues
  const captureSnapshot = useCallback((isHighlight = false) => {
    if (!editorRef.current || !isRecording) return;
    
    const snapshot = {
      content: editorRef.current.getValue(),
      cursorPosition: editorRef.current.getPosition(),
      scrollPosition: editorRef.current.getScrollTop(),
      isHighlight
    };
    
    onCodeSnapshot(snapshot);
  }, [isRecording, onCodeSnapshot]);
  
  // Initialize Monaco editor
  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: '// Start your code here\n',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
      });
      
      // Capture snapshot on significant changes
      const disposable = editorRef.current.onDidChangeModelContent((event) => {
        // Only capture on significant changes to avoid too many snapshots
        if (isRecording && event.changes.some(change => 
          change.text.includes('\n') || change.text.length > 10)
        ) {
          captureSnapshot(false);
        }
      });
      
      return () => {
        disposable.dispose();
        editorRef.current.dispose();
      };
    }
  }, [captureSnapshot, isRecording]);
  
  // Set up periodic snapshots when recording starts/stops
  useEffect(() => {
    if (isRecording && editorRef.current) {
      // Capture initial snapshot when recording starts
      captureSnapshot(true);
      
      // Set up periodic snapshots
      intervalRef.current = setInterval(() => {
        captureSnapshot(false);
      }, snapshotInterval);
    } else {
      // Clear interval when not recording
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, snapshotInterval, captureSnapshot]);
  
  // Function to explicitly mark important code points
  const markImportant = () => {
    captureSnapshot(true);
  };
  
  return (
    <div className="flex flex-col h-full">
      {isRecording && (
        <button 
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mb-2"
          onClick={markImportant}
        >
          Mark Important
        </button>
      )}
      <div 
        ref={containerRef} 
        className="flex-grow border rounded" 
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default CodeEditor;