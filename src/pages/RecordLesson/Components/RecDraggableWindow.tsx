import React, { useState, useRef, useEffect } from 'react';

const RecDraggableWindow = ({ htmlContent, title = "Preview" }) => {
  const [size, setSize] = useState({ width: 450, height: 400 });
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 450 - 20,
    y: window.innerHeight - 400 - 50,
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
  const resizeEdge = useRef(null);

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
      document.body.classList.add('dragging-active');
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'none';
      }
      if (windowRef.current) {
        windowRef.current.style.transition = 'none';
      }
      e.preventDefault();
    }
  };

  const onResizeStart = (e, edge) => {
    if (!minimized && !isMaximized) {
      resizing.current = true;
      resizeStartPos.current = { x: e.clientX, y: e.clientY };
      resizeStartSize.current = { width: size.width, height: size.height };
      resizeEdge.current = edge;
      document.body.classList.add('resizing-active');
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'none';
      }
      if (windowRef.current) {
        windowRef.current.style.transition = 'none';
      }
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (dragging.current && windowRef.current) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
  
      // Only update position when dragging
      setPosition({ x: newX, y: newY });
    } else if (resizing.current && windowRef.current) {
      let newWidth = resizeStartSize.current.width;
      let newHeight = resizeStartSize.current.height;
      let newX = position.x;
      let newY = position.y;
  
      switch (resizeEdge.current) {
        case 'right':
          newWidth = resizeStartSize.current.width + (e.clientX - resizeStartPos.current.x);
          break;
        case 'left':
          newWidth = resizeStartSize.current.width - (e.clientX - resizeStartPos.current.x);
          newX = resizeStartSize.current.width + position.x - newWidth;
          break;
        case 'bottom':
          newHeight = resizeStartSize.current.height + (e.clientY - resizeStartPos.current.y);
          break;
        case 'top':
          newHeight = resizeStartSize.current.height - (e.clientY - resizeStartPos.current.y);
          newY = resizeStartSize.current.height + position.y - newHeight;
          break;
        default:
          break;
      }
  
      // Only update size during resize
      setSize({
        width: Math.max(250, newWidth),
        height: Math.max(150, newHeight),
      });
  
      // Adjust content container size during resize
      const contentDiv = windowRef.current.querySelector('.content-container');
      if (contentDiv) {
        contentDiv.style.height = `${Math.max(150, newHeight) - 40}px`;
      }
    }
  };

  const handleMouseUp = () => {
    if (dragging.current) {
      dragging.current = false;
      document.body.classList.remove('dragging-active');
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'auto';
      }
    }

    if (resizing.current) {
      resizing.current = false;
      resizeEdge.current = null;
      document.body.classList.remove('resizing-active');
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'auto';
      }
    }
  };

  useEffect(() => {
    const optimizedMouseMove = (e) => {
      if (dragging.current || resizing.current) {
        e.preventDefault();
        handleMouseMove(e);
      }
    };

    document.addEventListener('mousemove', optimizedMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    const style = document.createElement('style');
    style.innerHTML = `
      .dragging-active, .resizing-active {
        cursor: grabbing !important;
        user-select: none !important;
      }
      .dragging-active iframe, .resizing-active iframe {
        pointer-events: none !important;
      }
      .dragging-active * {
        cursor: grabbing !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', optimizedMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.head.removeChild(style);
      document.body.classList.remove('dragging-active');
      document.body.classList.remove('resizing-active');
    };
  }, []);

  return (
    <div
      ref={windowRef}
      className="fixed bg-white border rounded-lg shadow-lg overflow-hidden z-150"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        willChange: 'transform, width, height',
        transition: (dragging.current || resizing.current) ? 'none' : 'transform 0.2s ease, width 0.2s ease, height 0.2s ease',
      }}
    >
      <div
        className="flex justify-between items-center p-2 bg-gray-200"
        style={{
          borderBottom: '1px solid #ccc',
          cursor: (minimized || isMaximized) ? 'default' : 'grab',
          touchAction: 'none',
        }}
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
        <div className="content-container overflow-auto bg-white w-full" style={{ height: `${size.height - 40}px` }}>
          <iframe
            srcDoc={htmlContent}
            ref={iframeRef}
            title="HTML Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
            style={{ display: 'block' }}
          />
        </div>
      )}

      {!minimized && !isMaximized && (
        <>
          <div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-e-resize w-3 h-20 bg-gray-300 opacity-70 hover:opacity-100"
            onMouseDown={(e) => onResizeStart(e, 'right')}
            style={{ touchAction: 'none' }}
          ></div>
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 cursor-w-resize w-3 h-20 bg-gray-300 opacity-70 hover:opacity-100"
            onMouseDown={(e) => onResizeStart(e, 'left')}
            style={{ touchAction: 'none' }}
          ></div>
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 cursor-s-resize h-3 w-20 bg-gray-300 opacity-70 hover:opacity-100"
            onMouseDown={(e) => onResizeStart(e, 'bottom')}
            style={{ touchAction: 'none' }}
          ></div>
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 cursor-n-resize h-3 w-20 bg-gray-300 opacity-70 hover:opacity-100"
            onMouseDown={(e) => onResizeStart(e, 'top')}
            style={{ touchAction: 'none' }}
          ></div>
        </>
      )}
    </div>
  );
};

export default RecDraggableWindow;