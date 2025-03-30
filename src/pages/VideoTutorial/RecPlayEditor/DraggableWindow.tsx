import React, { useState, useRef, useEffect } from 'react';

const RecDraggableWindow = ({ editorRef, language, htmlContent, title = "Preview" }) => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  
  // Calculate initial position at the right bottom of the screen
  const [position, setPosition] = useState({
    x: window.innerWidth - 450 - 20, // width is 450, 20 is margin
    y: window.innerHeight - 400 - 20, // height is 400, 20 is margin
  });
  
  const [size, setSize] = useState({ width: 450, height: 400 });
  const [minimized, setMinimized] = useState(false);
  const [originalState, setOriginalState] = useState(null); // Store original size and position
  const [isMaximized, setIsMaximized] = useState(false);

  const windowRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });

  // Header Variables
  const [url, setUrl] = useState('preview://html-output');

  const handleRefresh = () => {
    // Logic to refresh the content
    console.log('Refreshing preview...');
    // You could trigger a re-render of the HTML content here
  };

  const handleBack = () => {
    console.log('Back navigation not applicable for preview');
  };

  const handleForward = () => {
    console.log('Forward navigation not applicable for preview');
  };

  const toggleMinimize = () => {
    if (minimized) {
      // Restore original size and position
      if (originalState) {
        setSize(originalState.size);
        setPosition(originalState.position);
      }
      setMinimized(false);
    } else {
      // Store current size and position, then minimize
      setOriginalState({ size, position });
      const minimizedWidth = 350; // Width when minimized
      const minimizedHeight = 40; // Height when minimized (just the header)
      setSize({ width: minimizedWidth, height: minimizedHeight });
      setPosition({
        x: window.innerWidth - minimizedWidth - 20, // Right bottom corner
        y: window.innerHeight - minimizedHeight - 20,
      });
      setMinimized(true);
    }
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore original size and position
      if (originalState) {
        setSize(originalState.size);
        setPosition(originalState.position);
      }
      setIsMaximized(false);
    } else {
      // Store current size and position, then maximize
      setOriginalState({ size, position });
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      setPosition({ x: 20, y: 20 });
      setIsMaximized(true);
    }
  };

  const onDragStart = (e) => {
    if (!minimized && !isMaximized) { // Only allow dragging if not minimized or maximized
      setDragging(true);
      dragStartPos.current = { 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      };
      e.preventDefault();
    }
  };

  const onResizeStart = (e) => {
    if (!minimized && !isMaximized) { // Only allow resizing if not minimized or maximized
      setResizing(true);
      resizeStartPos.current = { x: e.clientX, y: e.clientY };
      resizeStartSize.current = { width: size.width, height: size.height };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging && !minimized && !isMaximized) {
        // Directly update the DOM element's position
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      } else if (resizing && !minimized && !isMaximized) {
        requestAnimationFrame(() => {
          const newWidth = resizeStartSize.current.width + (e.clientX - resizeStartPos.current.x);
          const newHeight = resizeStartSize.current.height + (e.clientY - resizeStartPos.current.y);
          
          setSize({
            width: Math.max(250, newWidth),
            height: Math.max(150, newHeight),
          });
        });
      }
    };

    const handleMouseUp = () => {
      if (dragging) {
        // Update the state with the final position after dragging ends
        const rect = windowRef.current.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.top });
      }
      setDragging(false);
      setResizing(false);
    };

    if (dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, minimized, isMaximized]);

  return (
    <div
      ref={windowRef}
      className="fixed bg-white border rounded-lg shadow-lg overflow-hidden z-50"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: dragging || resizing ? 'none' : 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
        cursor: dragging ? 'grabbing' : 'default',
      }}
    >
      <div
        className="flex justify-between items-center p-2 bg-gray-200"
        style={{ borderBottom: '1px solid #ccc', cursor: (minimized || isMaximized) ? 'default' : 'move' }}
        onMouseDown={onDragStart}
      >
        {/* Window Title */}
        <div className="font-semibold text-gray-700">{title}</div>

        {/* Navigation Buttons */}
        <div className="flex space-x-2">
          <button
            className="p-1 hover:bg-gray-300 rounded"
            onClick={handleRefresh}
            title="Refresh"
          >
            ↻
          </button>

          {/* Window Controls */}
          <button
            className="p-1 hover:bg-gray-300 rounded"
            onClick={toggleMinimize}
            title={minimized ? "Restore" : "Minimize"}
          >
            {minimized ? "□" : "—"}
          </button>
          {!minimized && (
            <button
              className="p-1 hover:bg-gray-300 rounded"
              onClick={toggleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "◱" : "□"}
            </button>
          )}
          <button
            className="p-1 hover:bg-red-300 rounded"
            onClick={() => windowRef.current.style.display = 'none'}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
      
      {!minimized && (
        <div 
          className="overflow-auto bg-white w-full" 
          style={{ height: `${size.height - 40}px` }}
        >
          <iframe
            srcDoc={htmlContent}
            title="HTML Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts"
          />
        </div>
      )}
      
      {!minimized && !isMaximized && (
        <div
          className="absolute bottom-0 right-0 cursor-se-resize w-6 h-6 bg-gray-300 opacity-70 hover:opacity-100"
          onMouseDown={onResizeStart}
          style={{ 
            borderTop: '1px solid #ccc', 
            borderLeft: '1px solid #ccc',
            borderTopLeftRadius: '4px'
          }}
        ></div>
      )}
    </div>
  );
};

export default RecDraggableWindow;