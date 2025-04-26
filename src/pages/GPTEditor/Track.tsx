import { useDrop } from 'react-dnd';
import useEditorStore from './_store/editorStore';
import ClipItem from './ClipItem';
import { useState } from 'react';

export default function Track({ trackId, title, type, clips }) {
  const { 
    zoom, 
    addToTimeline, 
    moveClipToTrack, 
    removeTrack, 
    autoAlign, 
    resolveOverlaps,
    duplicateTrack 
  } = useEditorStore();
  
  const [showMenu, setShowMenu] = useState(false);

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: ['asset', 'clip'],
    canDrop: (item) => {
      // Only allow dropping items of the same type
      return item.type === type;
    },
    drop: (item, monitor) => {
      if (item.type !== type) return;

      let x = 0;
      if (dropRef.current) {
        const clientOffset = monitor.getClientOffset();
        const trackRect = dropRef.current.getBoundingClientRect();
        x = clientOffset.x - trackRect.left;
      }

      const dropTime = Math.max(0, x / zoom);

      // Handle existing clip (move) vs new asset (add)
      if (item.index !== undefined && item.originalTrackId) {
        // Move existing clip
        moveClipToTrack(
          item.trackType,
          item.originalTrackId,
          item.index,
          type,
          trackId,
          dropTime
        );
      } else {
        // Add new asset with explicit startTime
        addToTimeline(type, trackId, { ...item, startTime: dropTime });
      }

      return { x };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Calculate total duration of all clips in this track
  const trackDuration = clips.reduce((total, clip) => {
    const clipEnd = clip.startTime + clip.duration;
    return clipEnd > total ? clipEnd : total;
  }, 0);

  // Get appropriate status indicator class
  const getStatusClass = () => {
    if (isOver && canDrop) return 'border-blue-400 bg-blue-50';
    if (isOver && !canDrop) return 'border-red-400 bg-red-50';
    return 'border-gray-300 hover:border-gray-400';
  };

  // Group clips by time to detect overlaps
  const getClipGroups = () => {
    const timeMap = new Map();
    
    clips.forEach((clip, index) => {
      const startTime = clip.startTime;
      const endTime = startTime + clip.duration;
      
      // Check each second interval the clip spans
      for (let t = Math.floor(startTime); t <= Math.ceil(endTime); t++) {
        if (!timeMap.has(t)) timeMap.set(t, []);
        timeMap.get(t).push(index);
      }
    });
    
    return timeMap;
  };
  
  // Check for any overlapping clips
  const hasOverlaps = () => {
    const timeMap = getClipGroups();
    
    for (const [time, indices] of timeMap.entries()) {
      if (indices.length > 1) {
        // Further check if they truly overlap at this time
        for (let i = 0; i < indices.length; i++) {
          for (let j = i + 1; j < indices.length; j++) {
            const clipA = clips[indices[i]];
            const clipB = clips[indices[j]];
            
            // Check if they overlap
            if (clipA.startTime < clipB.startTime + clipB.duration && 
                clipB.startTime < clipA.startTime + clipA.duration) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  };
  
  const overlapDetected = hasOverlaps();

  // Add track actions
  const handleAutoAlign = () => {
    autoAlign(type, trackId);
  };
  
  const handleResolveOverlaps = () => {
    resolveOverlaps(type, trackId);
  };
  
  const handleDuplicate = () => {
    duplicateTrack(type, trackId);
  };
  
  const toggleTrackMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <p className="text-xs font-medium text-gray-600 mr-2">{title}</p>
          {overlapDetected && (
            <span className="text-xs text-red-500 bg-red-50 px-1 rounded-sm">
              Overlapping clips
            </span>
          )}
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={toggleTrackMenu}
            className="text-xs px-1 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            ⋮
          </button>
        </div>
      </div>
      
      {/* Track dropdown menu */}
      {showMenu && (
        <div className="absolute right-0 top-6 z-40 bg-white rounded shadow-lg border border-gray-200 py-1 text-xs">
          {clips.length > 1 && (
            <>
              <button
                onClick={handleAutoAlign}
                className="w-full text-left px-3 py-1 hover:bg-gray-100"
              >
                Auto align clips
              </button>
              
              {overlapDetected && (
                <button
                  onClick={handleResolveOverlaps}
                  className="w-full text-left px-3 py-1 hover:bg-yellow-50 text-yellow-600"
                >
                  Fix overlapping clips
                </button>
              )}
              
              <div className="border-t border-gray-100 my-1"></div>
            </>
          )}
          
          <button
            onClick={handleDuplicate}
            className="w-full text-left px-3 py-1 hover:bg-gray-100"
          >
            Duplicate track
          </button>
          
          <button
            onClick={() => removeTrack(type, trackId)}
            className="w-full text-left px-3 py-1 hover:bg-red-50 text-red-500"
          >
            Remove track
          </button>
        </div>
      )}
      
      <div
        ref={dropRef}
        className={`timeline-track relative h-16 p-2 rounded border ${getStatusClass()} transition-colors duration-150`}
        style={{ minHeight: '60px' }}
        onClick={() => setShowMenu(false)}
      >
        {/* Empty track indicator */}
        {clips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 text-xs">Drop {type} clips here</p>
          </div>
        )}
        
        {/* Visual indicator of track length */}
        {trackDuration > 0 && (
          <div 
            className="absolute bottom-0 h-1 bg-gray-200"
            style={{ width: `${trackDuration * zoom}px`, left: '0' }}
          />
        )}
        
        {/* Clips */}
        {clips.map((clip, index) => (
          <div
            key={clip.id || index}
            className="absolute top-2"
            style={{ 
              left: `${clip.startTime * zoom}px`,
              zIndex: 10 + index // Ensure proper stacking
            }}
          >
            <ClipItem 
              clip={clip} 
              index={index} 
              trackId={trackId} 
              trackType={type} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}