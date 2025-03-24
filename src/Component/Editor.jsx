import React, { useRef, useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import _ from 'lodash';

function CodeEditor2() {
  const editorRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });
  const [scrollPosition, setScrollPosition] = useState({ scrollTop: 0, scrollLeft: 0 });
  const [code, setCode] = useState("// your code here");
  const [isRecording, setIsRecording] = useState(false);
  const startTimeRef = useRef(null);

  const lastSnapshotRef = useRef({
    code: "// your code here",
    cursorPosition: { lineNumber: 1, column: 1 },
    scrollPosition: { scrollTop: 0, scrollLeft: 0 },
    timestamp: 0 // Seconds from start
  });

  const getCurrentTimestamp = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return (Date.now() - startTimeRef.current) / 1000; // Convert to seconds
  }, []);

  const startRecording = () => {
    startTimeRef.current = Date.now();
    setIsRecording(true);
    sendSnapshotNow(0); // Take initial snapshot at time 0
  };

  const stopRecording = () => {
    setIsRecording(false);
    sendSnapshotNow(getCurrentTimestamp()); // Take final snapshot
  };

  // Track previous cursor position and scroll position to avoid redundant updates
  const prevCursorPosition = useRef(cursorPosition);
  const prevScrollPosition = useRef(scrollPosition);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      throttledSendSnapshot(); // Capture on content change, throttled
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position); // Update cursor position
      if (
        e.position.lineNumber !== prevCursorPosition.current.lineNumber ||
        e.position.column !== prevCursorPosition.current.column
      ) {
        prevCursorPosition.current = e.position;
        throttledSendSnapshot(); // Capture on cursor move, throttled
      }
    });

    editor.onDidScrollChange((e) => {
      setScrollPosition({ scrollTop: e.scrollTop, scrollLeft: e.scrollLeft }); // Update scroll position
      if (
        e.scrollTop !== prevScrollPosition.current.scrollTop ||
        e.scrollLeft !== prevScrollPosition.current.scrollLeft
      ) {
        prevScrollPosition.current = { scrollTop: e.scrollTop, scrollLeft: e.scrollLeft };
        throttledSendSnapshot(); // Capture on scroll, throttled
      }
    });
  };

  const isSignificantChange = useCallback(() => {
    if (!isRecording) return false;

    const currentSnapshot = { code, cursorPosition, scrollPosition };
    const lastSnapshot = lastSnapshotRef.current;

    // Skip if no significant code change or no significant time difference
    if (
      Math.abs(currentSnapshot.code.length - lastSnapshot.code.length) <= 10 &&
      Math.abs(currentSnapshot.cursorPosition.lineNumber - lastSnapshot.cursorPosition.lineNumber) <= 5 &&
      Math.abs(currentSnapshot.scrollPosition.scrollTop - lastSnapshot.scrollPosition.scrollTop) <= 100 &&
      getCurrentTimestamp() - lastSnapshot.timestamp < 10
    ) {
      return false;
    }

    return true; // If any of the conditions are met
  }, [code, cursorPosition, scrollPosition, isRecording, getCurrentTimestamp]);

  // Throttled snapshot function to make it responsive
  const throttledSendSnapshot = useCallback(
    _.throttle(() => {
      if (isSignificantChange()) {
        sendSnapshotNow();
      }
    }, 500), // Throttled for 500ms
    [cursorPosition, scrollPosition, isSignificantChange]
  );

  // Debounced snapshot function
  const debouncedSendSnapshot = useCallback(
    _.debounce(() => {
      if (isSignificantChange()) {
        sendSnapshotNow();
      }
    }, 500), // Debounced for 500ms
    [cursorPosition, scrollPosition, isSignificantChange]
  );

  // Send snapshot immediately to the server
  const sendSnapshotNow = async (customTimestamp = null) => {
    if (!editorRef.current) return;

    const currentCode = editorRef.current.getValue();
    const timestamp = customTimestamp !== null ? customTimestamp : getCurrentTimestamp();

    const snapshotData = {
      code: currentCode,
      cursorPosition: cursorPosition,
      scrollPosition: scrollPosition,
      timestamp: timestamp
    };

    try {
      const response = await axios.post('http://localhost:8000/api/save-code-snapshots/', snapshotData);

      // Log server response for debugging purposes
      console.log('Snapshot successfully saved:', response.data);

      // Update last snapshot reference
      lastSnapshotRef.current = { ...snapshotData };

    } catch (error) {
      console.error('Error saving snapshot to server:', error);
    }
  };

  // Periodic backup every 20 seconds to ensure snapshots are sent even without significant changes
  useEffect(() => {
    let intervalId = null;

    if (isRecording) {
      intervalId = setInterval(() => {
        const currentTime = getCurrentTimestamp();
        const timeSinceLastSnapshot = currentTime - lastSnapshotRef.current.timestamp;

        // Trigger snapshot if it's been too long since the last one
        if (timeSinceLastSnapshot > 20) {
          sendSnapshotNow(); // Trigger snapshot every 20 seconds for periodic backups
        }
      }, 20000); // Check every 20 seconds
    }

    return () => clearInterval(intervalId); // Cleanup interval
  }, [isRecording, getCurrentTimestamp]);

  return (
    <div>
      <Editor
        height="600px"
        defaultLanguage="javascript"
        defaultValue="// your code here"
        theme="vs-dark"
        onMount={handleEditorDidMount}
      />
      <div>
        <p>Cursor Position: Line {cursorPosition.lineNumber}, Column {cursorPosition.column}</p>
        <p>Scroll Position: scrollTop {scrollPosition.scrollTop}, scrollLeft {scrollPosition.scrollLeft}</p>
        <p>Recording Status: {isRecording ? 'Recording' : 'Not Recording'}</p>
        <p>Time Elapsed: {isRecording ? getCurrentTimestamp().toFixed(1) + 's' : '0.0s'}</p>

        {!isRecording ? (
          <button onClick={startRecording} className="start-btn">
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="stop-btn">
            Stop Recording
          </button>
        )}

        {isRecording && (
          <button onClick={() => sendSnapshotNow()} className="snapshot-btn">
            Save Snapshot Now
          </button>
        )}
      </div>
    </div>
  );
}

export default CodeEditor2;
