import { useDrag } from 'react-dnd';

export default function DraggableAsset({ asset }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'asset',
    item: asset,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  const bgColor = asset.type === 'video' ? 'bg-blue-50' : 'bg-green-50';
  const borderColor = asset.type === 'video' ? 'border-blue-200' : 'border-green-200';
  const iconEmoji = asset.type === 'video' ? '🎬' : '🔊';

  return (
    <div
      ref={dragRef}
      className={`border ${borderColor} p-2 rounded shadow cursor-move ${bgColor} ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center">
        <span className="mr-2">{iconEmoji}</span>
        <div>
          <p className="text-xs font-medium truncate">{asset.name}</p>
          <p className="text-xs text-gray-500">{asset.duration?.toFixed(1)}s</p>
        </div>
      </div>
    </div>
  );
}