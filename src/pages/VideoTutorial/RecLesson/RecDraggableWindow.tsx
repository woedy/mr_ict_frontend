import React, { useState, useRef, useEffect } from 'react';

const RecDraggableWindow = ({ htmlContent, title = "Preview" }) => {
  const [size, setSize] = useState({ width: 450, height: 400 });
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 450 - 20,
    y: window.innerHeight - 400 - 20,
  });
  const [originalState, setOriginalState] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const windowRef = useRef(null);
  const iframeRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const dragging = useRef(false);
  const resizing = useRef(false);

  // Update iframe content on htmlContent change
  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
    }
  }, [htmlContent]);

  const handleRefresh = () => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
    }
  };

  const toggleMinimize = () => {
    if (minimized) {
      if (originalState) {
        setSize(originalState.size);
        setPosition(originalState.position);
      }
      setMinimized(false);
    } else {
      setOriginalState({ size, position });
      setSize({ width: 350, height: 40 });
      setPosition({
        x: window.innerWidth - 350 - 20,
        y: window.innerHeight - 40 - 20,
      });
      setMinimized(true);
    }
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      if (originalState) {
        setSize(originalState.size);
        setPosition(originalState.position);
      }
      setIsMaximized(false);
    } else {
      setOriginalState({ size, position });
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      setPosition({ x: 20, y: 20 });
      setIsMaximized(true);
    }
  };

  const onDragStart = (e) => {
    if (!minimized && !isMaximized) {
      dragging.current = true;
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      e.preventDefault();
    }
  };

  const onResizeStart = (e) => {
    if (!minimized && !isMaximized) {
      resizing.current = true;
      resizeStartPos.current = { x: e.clientX, y: e.clientY };
      resizeStartSize.current = { width: size.width, height: size.height };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (dragging.current && !minimized && !isMaximized) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      windowRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    } else if (resizing.current && !minimized && !isMaximized) {
      const newWidth = resizeStartSize.current.width + (e.clientX - resizeStartPos.current.x);
      const newHeight = resizeStartSize.current.height + (e.clientY - resizeStartPos.current.y);
      windowRef.current.style.width = `${Math.max(250, newWidth)}px`;
      windowRef.current.style.height = `${Math.max(150, newHeight)}px`;
    }
  };

  const handleMouseUp = () => {
    if (dragging.current) {
      dragging.current = false;
      const rect = windowRef.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
    }
    if (resizing.current) {
      resizing.current = false;
      const rect = windowRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={windowRef}
      className="fixed bg-white border rounded-lg shadow-lg overflow-hidden z-50"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: dragging.current || resizing.current ? 'none' : 'transform 0.1s ease, width 0.1s ease, height 0.1s ease',
      }}
    >
      <div
        className="flex justify-between items-center p-2 bg-gray-200"
        style={{ borderBottom: '1px solid #ccc', cursor: (minimized || isMaximized) ? 'default' : 'move' }}
        onMouseDown={onDragStart}
      >
        <div className="font-semibold text-gray-700">{title}</div>
        <div className="flex space-x-2">
          <button
            className="p-1 hover:bg-gray-300 rounded"
            onClick={handleRefresh}
            title="Refresh"
          >
            ↻
          </button>
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
            onClick={() => (windowRef.current.style.display = 'none')}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="overflow-auto bg-white w-full" style={{ height: `${size.height - 40}px` }}>
          <iframe
            srcDoc={htmlContent}
            ref={iframeRef}
            title="HTML Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
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
            borderTopLeftRadius: '4px',
          }}
        ></div>
      )}
    </div>
  );
};

export default RecDraggableWindow;
