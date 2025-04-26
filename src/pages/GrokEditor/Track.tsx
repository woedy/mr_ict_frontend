
import { useDrop } from 'react-dnd';
import useEditorStore from './_store/editorStore';
import ClipItem from './ClipItem';

export default function Track({ trackId, title, type, clips }) {
  const { zoom, addToTimeline, removeTrack, currentTime } = useEditorStore();

  // Calculate track height based on overlapping clips
  const trackHeight = Math.max(64, clips.reduce((maxOverlap, clip, index) => {
    let overlapCount = 1;
    clips.forEach((otherClip, otherIndex) => {
      if (index !== otherIndex &&
          clip.startTime < otherClip.startTime + otherClip.duration &&
          clip.startTime + clip.duration > otherClip.startTime) {
        overlapCount++;
      }
    });
    return Math.max(maxOverlap, overlapCount * 56); // 56px per clip height
  }, 64));

  const [{ isOver }, dropRef] = useDrop({
    accept: ['asset', 'clip'],
    drop: (item, monitor) => {
      if (item.type !== type) return;

      let x = 0;
      if (dropRef.current) {
        const clientOffset = monitor.getClientOffset();
        const trackRect = dropRef.current.getBoundingClientRect();
        x = clientOffset.x - trackRect.left;
      }

      const dropTime = Math.max(0, x / zoom);
      addToTimeline(type, trackId, { ...item, startTime: dropTime });

      return { x };
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
        className={`timeline-track relative p-2 rounded border ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
        style={{ height: `${trackHeight}px` }}
      >
        {clips.map((clip, index) => {
          // Calculate vertical offset for overlapping clips
          let overlapIndex = 0;
          clips.slice(0, index).forEach((otherClip) => {
            if (clip.startTime < otherClip.startTime + otherClip.duration &&
                clip.startTime + clip.duration > otherClip.startTime) {
              overlapIndex++;
            }
          });
          return (
            <div
              key={clip.id || index}
              className="absolute top-2"
              style={{
                left: `${clip.startTime * zoom}px`,
                top: `${overlapIndex * 56}px`, // Stack clips vertically
              }}
            >
              <ClipItem clip={clip} index={index} trackId={trackId} trackType={type} />
            </div>
          );
        })}
        {clips.length === 0 && (
          <p className="text-gray-400 text-xs">Drop {type} clips here</p>
        )}
      </div>
    </div>
  );
}