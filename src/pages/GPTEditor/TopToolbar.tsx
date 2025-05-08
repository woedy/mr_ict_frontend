
import { useState } from 'react';
import useEditorStore from './_store/editorStore';

export default function TopToolbar() {
  const addAsset = useEditorStore((s) => s.addAsset);
  const checkerboardClips = useEditorStore((s) => s.checkerboardClips);
  const assets = useEditorStore((s) => s.assets);
  const [checkerboardGap, setCheckerboardGap] = useState(0);

  const generateThumbnail = (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.currentTime = 1;
      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      });
    });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');
      if (!isAudio && !isVideo) continue;

      const media = document.createElement(isAudio ? 'audio' : 'video');
      media.src = url;

      const asset = await new Promise((resolve) => {
        media.addEventListener('loadedmetadata', async () => {
          const thumbnail = isVideo ? await generateThumbnail(url) : null;
          resolve({
            file,
            name: file.name,
            url,
            type: isAudio ? 'audio' : 'video',
            duration: media.duration,
            thumbnail,
          });
        });
      });

      addAsset(asset);
    }
  };


  return (
    <div className="bg-white px-4 py-2 border-b border-gray-300 flex gap-4">
      <label className="text-sm cursor-pointer">
        Upload Asset
        <input type="file" accept="video/*,audio/*" multiple hidden onChange={handleUpload} />
      </label>
      <button
        onClick={() => useEditorStore.getState().undo()}
        className="text-sm text-blue-600"
      >
        Undo
      </button>
      <button
        onClick={() => useEditorStore.getState().redo()}
        className="text-sm text-blue-600"
      >
        Redo
      </button>

    </div>
  );
}