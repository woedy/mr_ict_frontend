import { useDrop } from 'react-dnd';
import useEditorStore from './_store/editorStore';
import ClipItem from './ClipItem';

export default function Track({ trackId, title, type, clips }) {
  const { zoom, addToTimeline, removeTrack } = useEditorStore();
  
  const [{ isOver }, dropRef] = useDrop({
    accept: ['asset', 'clip'],
    drop: (item) => {
      // Check if the item type matches the track type
      if (item.type === type) {
        addToTimeline(type, trackId, item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs font-medium text-gray-600">{title}</p>
        <button 
          onClick={() => removeTrack(type, trackId)}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
      <div
        ref={dropRef}
        className={`timeline-track relative h-16 p-2 rounded border ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
      >
        {/* Position clips absolutely based on their startTime */}
        {clips.map((clip, index) => (
          <div 
            key={clip.id || index}
            className="absolute top-2"
            style={{ 
              left: `${clip.startTime * zoom}px`,
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
        
        {/* Empty state */}
        {clips.length === 0 && (
          <p className="text-gray-400 text-xs">Drop {type} clips here</p>
        )}
      </div>
    </div>
  );
}