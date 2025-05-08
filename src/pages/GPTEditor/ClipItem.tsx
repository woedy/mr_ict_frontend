import { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import useEditorStore from './_store/editorStore';
import ClipContextMenu from './ClipContextMenu';

export default function ClipItem({ clip, index, trackId, trackType }) {
  const zoom = useEditorStore((s) => s.zoom);
  const deleteClip = useEditorStore((s) => s.deleteClip);
  const splitClip = useEditorStore((s) => s.splitClip);
  const moveClip = useEditorStore((s) => s.moveClip);
  const updateClip = useEditorStore((s) => s.updateClip);
  const timelineTracks = useEditorStore((s) => s.timelineTracks);
  const currentTime = useEditorStore((s) => s.currentTime);
  
  const [resizing, setResizing] = useState(null); // 'start', 'end' or null
  const [initialX, setInitialX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  const [initialStartTime, setInitialStartTime] = useState(0);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const ref = useRef(null);
  
  // Get all clips in this track for snapping
  const trackClips = timelineTracks[trackType].find(t => t.id === trackId)?.clips || [];
  const otherClips = trackClips.filter(c => c.id !== clip.id);

  const getSnappingPoints = () => {
    const points = [];
    
    // Add snap points for other clips
    otherClips.forEach(c => {
      points.push(c.startTime); // Start of clip
      points.push(c.startTime + c.duration); // End of clip
    });
    
    // Add snap points at regular intervals (e.g., every second)
    for (let i = 0; i <= 300; i++) {
      points.push(i);
    }
    
    return points;
  };

  const snapToPoint = (time, threshold = 0.2) => {
    const snapPoints = getSnappingPoints();
    let closest = time;
    let minDistance = threshold;
    
    snapPoints.forEach(point => {
      const distance = Math.abs(time - point);
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    });
    
    return closest;
  };

  const [{ isDragging }, drag] = useDrag({
    type: 'clip',
    item: { 
      ...clip, 
      index, 
      trackId, 
      trackType,
      originalTrackId: trackId,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !resizing && !showContextMenu,
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        const dropResult = monitor.getDropResult();
        if (dropResult && dropResult.x !== undefined) {
          const newStartTime = Math.max(0, dropResult.x / zoom);
          if (item.trackId === trackId) {
            moveClip(trackType, trackId, index, newStartTime);
          }
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
    setInitialStartTime(clip.startTime);
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - initialX;
      const newWidth = Math.max(10, initialWidth - deltaX); // Minimum 10px width
      const newDuration = newWidth / zoom;
      
      // Calculate new start time
      const newStartTime = initialStartTime + (clip.duration - newDuration);
      
      // Find potential snap points
      const snappedStartTime = snapToPoint(newStartTime);
      const snappedDuration = initialStartTime + clip.duration - snappedStartTime;
      
      // Check if it would overlap with previous clip
      const prevClip = otherClips
        .filter(c => c.startTime + c.duration <= snappedStartTime)
        .sort((a, b) => (b.startTime + b.duration) - (a.startTime + a.duration))[0];
      
      let finalStartTime = snappedStartTime;
      let finalDuration = snappedDuration;
      
      // Don't allow overlap with previous clip
      if (prevClip && finalStartTime < prevClip.startTime + prevClip.duration) {
        finalStartTime = prevClip.startTime + prevClip.duration;
        finalDuration = initialStartTime + clip.duration - finalStartTime;
      }
      
      // Make sure duration stays positive
      if (finalDuration < 0.1) {
        finalDuration = 0.1;
        finalStartTime = initialStartTime + clip.duration - finalDuration;
      }
      
      // Update both startTime and duration
      updateClip(trackType, trackId, index, {
        startTime: finalStartTime,
        duration: finalDuration,
        mediaOffset: (clip.mediaOffset || 0) + (clip.duration - finalDuration),
      });
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
      const newWidth = Math.max(10, initialWidth + deltaX); // Minimum 10px width
      const newDuration = newWidth / zoom;
      
      // Find potential snap points for end time
      const endTime = clip.startTime + newDuration;
      const snappedEndTime = snapToPoint(endTime);
      const snappedDuration = snappedEndTime - clip.startTime;
      
      // Check if it would overlap with next clip
      const nextClip = otherClips
        .filter(c => c.startTime > clip.startTime)
        .sort((a, b) => a.startTime - b.startTime)[0];
      
      let finalDuration = snappedDuration;
      
      // Don't allow overlap with next clip
      if (nextClip && clip.startTime + finalDuration > nextClip.startTime) {
        finalDuration = nextClip.startTime - clip.startTime;
      }
      
      // Make sure duration stays positive
      if (finalDuration < 0.1) finalDuration = 0.1;
      
      // Update duration only
      updateClip(trackType, trackId, index, {
        duration: finalDuration,
      });
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Position context menu near the click but ensure it stays in view
    setContextMenuPosition({ 
      x: e.clientX, 
      y: e.clientY 
    });
    
    setShowContextMenu(true);
  };
  
  // Check if this clip contains the playhead
  const isPlayheadInside = currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration;
  
  // Get appropriate styling based on clip type
  const getBgColor = () => {
    if (trackType === 'video') return 'from-blue-600 to-blue-500';
    if (trackType === 'audio') return 'from-green-600 to-green-500';
    return 'from-gray-600 to-gray-500';
  };

  return (
    <>
      <div
        ref={ref}
        className={`relative rounded shadow text-xs ${
          isDragging ? 'opacity-50 z-50' : 'opacity-90'
        } bg-gradient-to-b ${getBgColor()} border ${isPlayheadInside ? 'border-yellow-300' : 'border-white border-opacity-20'} overflow-hidden`}
        style={{ 
          width: `${width}px`,
          cursor: resizing ? (resizing === 'start' ? 'w-resize' : 'e-resize') : 'grab',
          height: '50px',
          transition: 'box-shadow 0.2s',
          boxShadow: isDragging ? '0 0 8px rgba(0,0,0,0.5)' : (isPlayheadInside ? '0 0 5px rgba(255,215,0,0.7)' : '0 1px 3px rgba(0,0,0,0.2)'),
        }}
        onContextMenu={handleContextMenu}
      >
        {trackType === 'video' && clip.thumbnail && (
          <div className="absolute inset-0 opacity-30 bg-center bg-cover" 
               style={{ backgroundImage: `url(${clip.thumbnail})` }} />
        )}
        
        <div className="absolute inset-0 p-2 flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <span className="font-medium truncate max-w-[80%] drop-shadow-sm" title={clip.name}>
              {clip.name}
            </span>
            <span className="text-[10px] bg-black bg-opacity-30 px-1 rounded">
              {clip.duration.toFixed(1)}s
            </span>
          </div>

          <div className="flex gap-1 mt-auto">
       
            <button 
              onClick={() => deleteClip(trackType, trackId, index)} 
              className="bg-red-600 px-1 rounded text-[10px] hover:bg-red-700 transition-colors"
              title="Delete clip"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Playhead indicator when inside clip */}
        {isPlayheadInside && (
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-yellow-300 z-10"
            style={{ 
              left: `${(currentTime - clip.startTime) * zoom}px`,
              boxShadow: '0 0 4px rgba(255,215,0,0.7)' 
            }}
          />
        )}

        {/* Trim handles */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-white hover:bg-opacity-30 group"
          onMouseDown={handleTrimStartMouseDown}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 bg-white"></div>
        </div>
        <div 
          className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white hover:bg-opacity-30 group"
          onMouseDown={handleTrimEndMouseDown}
        >
          <div className="absolute right-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 bg-white"></div>
        </div>
      </div>
      
      {/* Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed z-50"
          style={{ 
            top: contextMenuPosition.y, 
            left: contextMenuPosition.x 
          }}
        >
          <ClipContextMenu
            clip={clip}
            trackId={trackId}
            trackType={trackType}
            index={index}
            onClose={() => setShowContextMenu(false)}
          />
        </div>
      )}
    </>
  );
}