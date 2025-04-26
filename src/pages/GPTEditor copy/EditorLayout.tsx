import { useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import TopToolbar from './TopToolbar';
import VideoPreview from './VideoPreview';
import AssetLibrary from './AssetLibrary';
import TimelineHeader from './TimelineHeader';
import Timeline from './Timeline';
import PlaybackControls from './PlaybackControls';
import useEditorStore from './_store/editorStore';

export default function EditorLayout() {
  const zoom = useEditorStore(s => s.zoom);
  const setZoom = useEditorStore(s => s.setZoom);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [duration, setDuration] = useState(10);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen text-black">
        <TopToolbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: Assets */}
          <div className="w-[250px] bg-white border-r border-gray-200 overflow-y-auto">
            <AssetLibrary />
          </div>

          {/* Right: Preview + Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <VideoPreview videoRef={videoRef} audioRef={audioRef} setDuration={setDuration} />

            <PlaybackControls videoRef={videoRef} audioRef={audioRef} duration={duration} />

            <div className="h-[220px] overflow-y-auto bg-gray-100">
              <TimelineHeader duration={60} />
              <Timeline videoRef={videoRef} audioRef={audioRef} duration='60' />
              <div className="bg-white px-4 py-2 border-t border-gray-300">
                <label className="text-xs text-gray-600">Zoom:</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
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
