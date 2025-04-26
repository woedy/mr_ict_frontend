
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useEditorStore from './_store/editorStore';

export default function TimelineHeader({ duration = 60 }) {
  const zoom = useEditorStore((s) => s.zoom);
  const grid = Array.from({ length: Math.ceil(duration) }, (_, i) => i);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex text-xs text-gray-600 border-b border-gray-300">
        {grid.map((sec) => (
          <div
            key={sec}
            className="h-6 border-l border-gray-300 text-center"
            style={{ width: `${zoom}px` }}
          >
            {sec % 5 === 0 ? `${sec}s` : ''}
          </div>
        ))}
      </div>
    </DndProvider>
  );
}
