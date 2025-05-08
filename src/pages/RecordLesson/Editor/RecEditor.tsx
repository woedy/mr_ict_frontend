import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import axios from 'axios';

const RecEditor = ({ isRecording, title, getCurrentTimestamp }) => {
  const editorRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });
  const [scrollPosition, setScrollPosition] = useState({ scrollTop: 0, scrollLeft: 0 });
  const [code, setCode] = useState("<!-- Write your HTML code here -->");
  
  // Buffer to store code snapshots before sending
  const codeBufferRef = useRef([]);
  
  // To track significant changes for efficient snapshot collection
  const lastSnapshotRef = useRef({
    code: "<!-- Write your HTML code here -->",
    cursorPosition: { lineNumber: 1, column: 1 },
    scrollPosition: { scrollTop: 0, scrollLeft: 0 },
    timestamp: 0,
  });

  // Only capture snapshots if recording is active
  useEffect(() => {
    if (!isRecording) {
      // Clear buffer when not recording
      codeBufferRef.current = [];
      setCode("<!-- Write your HTML code here -->")
    }
  }, [isRecording]);

  // Function to determine if current state is different enough from last snapshot
  const hasSignificantChanges = useCallback(() => {
    const lastSnapshot = lastSnapshotRef.current;
    
    // Check if code has changed significantly (more than just a character or two)
    const codeChanged = code !== lastSnapshot.code;
    
    // Check if cursor moved to a different line or moved significantly on same line
    const cursorMoved = 
      cursorPosition.lineNumber !== lastSnapshot.cursorPosition.lineNumber ||
      Math.abs(cursorPosition.column - lastSnapshot.cursorPosition.column) > 10;
    
    // Check if scrolled significantly
    const scrolled = 
      Math.abs(scrollPosition.scrollTop - lastSnapshot.scrollPosition.scrollTop) > 50 ||
      Math.abs(scrollPosition.scrollLeft - lastSnapshot.scrollPosition.scrollLeft) > 50;
    
    return codeChanged || cursorMoved || scrolled;
  }, [code, cursorPosition, scrollPosition]);

  // Debounced function to send buffered snapshots to the server
  const sendBufferedSnapshots = useCallback(
    _.debounce(async () => {
      if (codeBufferRef.current.length > 0 && isRecording) {
        const snapshotsToSend = [...codeBufferRef.current];
        codeBufferRef.current = []; // Clear the buffer
        
        try {
          const response = await axios.post('http://localhost:8000/api/save-code-snapshots/', {
            snapshots: snapshotsToSend,
            title: title,
          });
          console.log('Snapshots batch saved:', response.data);
        } catch (error) {
          console.error('Error saving snapshots batch:', error);
          // Optionally, could re-add failed snapshots back to buffer for retry
          codeBufferRef.current = [...codeBufferRef.current, ...snapshotsToSend];
        }
      }
    }, 2000), // 2 seconds debounce for better batching
    [isRecording, title]
  );

  // Throttled snapshot collection function
  const captureSnapshot = useCallback(
    _.throttle(() => {
      if (!isRecording) return;
      
      const currentTimestamp = getCurrentTimestamp();
      
      // Only capture if there are significant changes or enough time has passed
      if (hasSignificantChanges() || 
          currentTimestamp - lastSnapshotRef.current.timestamp > 3) { // At least every 3 seconds
        
        const currentSnapshot = {
          code,
          cursorPosition,
          scrollPosition,
          timestamp: currentTimestamp,
        };
        
        // Add to buffer
        codeBufferRef.current.push(currentSnapshot);
        
        // Update last snapshot reference
        lastSnapshotRef.current = {...currentSnapshot};
        
        // Trigger the debounced send
        sendBufferedSnapshots();
      }
    }, 500), // Throttle to max one capture every 500ms
    [code, cursorPosition, scrollPosition, isRecording, getCurrentTimestamp, hasSignificantChanges, sendBufferedSnapshots]
  );

  // Force capture a snapshot - useful for significant events
  const forceSnapshot = useCallback(() => {
    if (!isRecording) return;
    
    const currentSnapshot = {
      code,
      cursorPosition,
      scrollPosition,
      timestamp: getCurrentTimestamp(),
    };
    
    codeBufferRef.current.push(currentSnapshot);
    lastSnapshotRef.current = {...currentSnapshot};
    sendBufferedSnapshots();
  }, [code, cursorPosition, scrollPosition, isRecording, getCurrentTimestamp, sendBufferedSnapshots]);

  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Capture on content change (typing)
    editor.onDidChangeModelContent(() => {
      setCode(editor.getValue());
      captureSnapshot();
    });

    // Capture on cursor movement
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position);
      captureSnapshot();
    });

    // Capture on scrolling
    editor.onDidScrollChange((e) => {
      setScrollPosition({ scrollTop: e.scrollTop, scrollLeft: e.scrollLeft });
      captureSnapshot();
    });
  };

  // Force snapshot on language change or other significant editor events
  const handleEditorChange = (value) => {
    setCode(value);
    // We don't call captureSnapshot here as it's already called by onDidChangeModelContent
  };

  // Ensure we send any remaining snapshots when component unmounts
  useEffect(() => {
    return () => {
      if (codeBufferRef.current.length > 0 && isRecording) {
        sendBufferedSnapshots.flush(); // Force immediate execution of debounced function
      }
    };
  }, [sendBufferedSnapshots, isRecording]);

  // Force capture snapshot when recording state changes
  useEffect(() => {
    if (isRecording) {
      forceSnapshot(); // Capture initial state when recording starts
    }
  }, [isRecording, forceSnapshot]);

  return (
    <main className="flex-1 bg-gray-900 text-black">
      <Editor
        language="html"
        onChange={handleEditorChange}
        value={code}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false }, // Optional: disable minimap for cleaner recording
          fontSize: 16, // Optional: larger font for better visibility in recordings
        }}
      />
    </main>
  );
};

export default RecEditor;