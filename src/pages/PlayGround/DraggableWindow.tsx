import React, { useState, useRef } from 'react';

const DraggableWindow = () => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 300, height: 200 });

  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0 });

  const onDragStart = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const onResizeStart = (e) => {
    setResizing(true);
    resizeStart.current = { width: size.width, height: size.height };
  };

  const onMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
    if (resizing) {
      setSize({
        width: resizeStart.current.width + e.clientX - dragStart.current.x,
        height: resizeStart.current.height + e.clientY - dragStart.current.y,
      });
    }
  };

  const onMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  return (
    <div
      className="fixed bg-white border rounded-lg shadow-lg"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div
        className="flex justify-between items-center p-2 cursor-move bg-gray-200"
        onMouseDown={onDragStart}
      >
        <span className="text-sm font-bold">Draggable Window</span>
        <button className="text-sm" onClick={() => alert('Window closed')}>
          X
        </button>
      </div>
      <div className="p-4">
        <p>This is a draggable and resizable window.</p>
      </div>
      <div
        className="absolute bottom-0 right-0 cursor-se-resize bg-gray-500"
        onMouseDown={onResizeStart}
        style={{ width: '20px', height: '20px' }}
      ></div>
    </div>
  );
};

export default DraggableWindow;
