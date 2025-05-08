// EditorLayout.tsx
import { useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { debounce } from 'lodash';
import TopToolbar from './TopToolbar';
import VideoPreview from './VideoPreview';
import AssetLibrary from './AssetLibrary';
import TimelineHeader from './TimelineHeader';
import Timeline from './Timeline';
import PlaybackControls from './PlaybackControls';
import useEditorStore from './_store/editorStore';

export default function EditorLayout() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const debouncedSetZoom = debounce((value) => setZoom(value), 100);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRefs = useRef([]); // Changed to array to match VideoPreview

  const [duration, setDuration] = useState(10);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen text-black">
        <TopToolbar />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[250px] bg-white border-r border-gray-200 overflow-y-auto">
            <AssetLibrary />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <VideoPreview
              videoRef={videoRef}
              audioRefs={audioRefs} // Pass audioRefs instead of audioRef
              setDuration={setDuration}
            />
            <PlaybackControls
              videoRef={videoRef}
              audioRefs={audioRefs} // Pass audioRefs
              duration={duration}
            />
            <div className="h-[220px] sm:h-[300px] lg:h-[400px] overflow-y-auto bg-gray-3 p-4">
              <Timeline
                videoRef={videoRef} // Pass first audioRef if needed elsewhere
                duration={duration}
              />
              <div className="bg-white px-4 py-2 border-t border-gray-300">
                <label className="text-xs text-gray-600">Zoom:</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={zoom}
                  onChange={(e) => debouncedSetZoom(Number(e.target.value))}
                  className="ml-2 w-1/2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}