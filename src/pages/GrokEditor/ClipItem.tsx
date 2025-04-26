

import { useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import useEditorStore from './_store/editorStore';

export default function ClipItem({ clip, index, trackId, trackType }) {
  const zoom = useEditorStore((s) => s.zoom);
  const deleteClip = useEditorStore((s) => s.deleteClip);
  const splitClip = useEditorStore((s) => s.splitClip);
  const moveClip = useEditorStore((s) => s.moveClip);
  const [isDragging, setIsDragging] = useState(false);
  const [resizing, setResizing] = useState(null); // 'start', 'end' or null
  const [initialX, setInitialX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);

  const ref = useRef(null);

  const [{ isDraggingDnD }, drag] = useDrag({
    type: 'clip',
    item: { 
      ...clip, 
      index, 
      trackId, 
      trackType,
      originalTrackId: trackId,
    },
    collect: (monitor) => ({
      isDraggingDnD: monitor.isDragging(),
    }),
    canDrag: () => !resizing,
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        const dropResult = monitor.getDropResult();
        if (dropResult && dropResult.x !== undefined) {
          const newStartTime = Math.max(0, dropResult.x / zoom);
          moveClip(trackType, trackId, index, newStartTime);
        }
      }
    },
  });

  drag(ref);

  const width = clip.duration * zoom;

  const handleTrimStartMouseDown = (e) => {
    e.stopPropagation();
    setResizing('start');
    setInitialX(e.clientX);
    setInitialWidth(width);

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - initialX;
      const newWidth = Math.max(30, initialWidth - deltaX);
      const newDuration = newWidth / zoom;
      const newStartTime = clip.startTime + (clip.duration - newDuration);

      moveClip(trackType, trackId, index, newStartTime);
      // Note: Duration trimming requires updateClipDuration
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTrimEndMouseDown = (e) => {
    e.stopPropagation();
    setResizing('end');
    setInitialX(e.clientX);
    setInitialWidth(width);

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - initialX;
      const newWidth = Math.max(30, initialWidth + deltaX);
      const newDuration = newWidth / zoom;
      // Note: Duration trimming requires updateClipDuration
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={ref}
      className={`relative rounded shadow text-xs ${
        isDraggingDnD ? 'opacity-50' : 'opacity-90'
      }`}
      style={{ 
        width: `${width}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: trackType === 'video' ? '#3b82f6' : '#10b981',
        height: '50px',
        zIndex: index, // Ensure later clips appear on top
      }}
    >
      {trackType === 'video' && clip.thumbnail && (
        <div className="absolute inset-0 opacity-30 bg-center bg-cover" 
             style={{ backgroundImage: `url(${clip.thumbnail})` }} />
      )}
      
      <div className="absolute inset-0 p-2 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <span className="font-medium truncate max-w-[80%]" title={clip.name}>
            {clip.name}
          </span>
          <span className="text-[10px] bg-black bg-opacity-30 px-1 rounded">
            {clip.duration.toFixed(1)}s
          </span>
        </div>

        <div className="flex gap-1 mt-auto">
          <button 
            onClick={() => splitClip(trackType, trackId, index)} 
            className="bg-yellow-500 px-1 rounded text-[10px]"
            title="Split clip at playhead"
          >
            ✂️
          </button>
          <button 
            onClick={() => deleteClip(trackType, trackId, index)} 
            className="bg-red-600 px-1 rounded text-[10px]"
            title="Delete clip"
          >
            ✕
          </button>
        </div>
      </div>

      <div 
        className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-white hover:bg-opacity-30"
        onMouseDown={handleTrimStartMouseDown}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white hover:bg-opacity-30"
        onMouseDown={handleTrimEndMouseDown}
      />
    </div>
  );
}