import React, { useState, useRef, useEffect } from 'react';

const DraggableVideoWindow = ({video}) => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  
  // Calculate initial position at the left bottom of the screen
  const [position, setPosition] = useState({
    x: 20, // 20px margin from the left
    y: window.innerHeight - 200 - 20, // 200 is the initial height, 20 is margin
  });
  
  const [size, setSize] = useState({ width: 300, height: 200 });
  const [minimized, setMinimized] = useState(false);
  const [originalState, setOriginalState] = useState(null); // Store original size and position

  const windowRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });

  const onDragStart = (e) => {
    setDragging(true);
    dragStartPos.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
    e.preventDefault();
  };

  const onResizeStart = (e) => {
    setResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { width: size.width, height: size.height };
    e.preventDefault();
  };

  const toggleMinimize = () => {
    if (minimized) {
      // Restore original size and position
      setSize(originalState.size);
      setPosition(originalState.position);
      setMinimized(false);
    } else {
      // Store current size and position, then minimize
      setOriginalState({ size, position });
      const minimizedHeight = 40; // Height when minimized
      setSize({ width: size.width, height: minimizedHeight });
      setPosition({
        x: 0, // Bottom-left corner
        y: window.innerHeight - minimizedHeight,
      });
      setMinimized(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        // Directly update the DOM element's position
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      } else if (resizing && !minimized) {
        requestAnimationFrame(() => {
          const newWidth = resizeStartSize.current.width + (e.clientX - resizeStartPos.current.x);
          const newHeight = resizeStartSize.current.height + (e.clientY - resizeStartPos.current.y);
          
          setSize({
            width: Math.max(150, newWidth),
            height: Math.max(minimized ? 40 : 100, newHeight),
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
  }, [dragging, resizing, minimized]);

  return (
    <div
      ref={windowRef}
      className="fixed bg-white border rounded-lg shadow-lg overflow-hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: dragging || resizing ? 'none' : 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
      }}
    >
      <div
        className="flex justify-between items-center p-2 cursor-move bg-gray-200"
        onMouseDown={onDragStart}
      >
        <span className="text-sm font-bold truncate">Video Window</span>
        <button 
          className="text-sm px-2 hover:bg-gray-300 rounded" 
          onClick={toggleMinimize}
          title={minimized ? "Maximize" : "Minimize"}
        >
          {minimized ? "□" : "—"}
        </button>
      </div>
      
      {!minimized && (
        <div className="p-4 overflow-auto" style={{ height: `${size.height - 40}px` }}>
          <video
            controls
            style={{ width: '100%', height: 'auto' }}
            src={video}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {!minimized && (
        <div
          className="absolute bottom-0 right-0 cursor-se-resize w-5 h-5 bg-gray-300 opacity-70 hover:opacity-100"
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

export default DraggableVideoWindow;
