import useEditorStore from './_store/editorStore';

export default function TopToolbar() {
  const addAsset = useEditorStore((s) => s.addAsset);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
  
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');
  
      if (!isAudio && !isVideo) return;
  
      const media = document.createElement(isAudio ? 'audio' : 'video');
      media.src = url;
  
      media.addEventListener('loadedmetadata', () => {
        const asset = {
          file,
          name: file.name,
          url,
          type: isAudio ? 'audio' : 'video',
          duration: media.duration,
        };
  
        addAsset(asset);
      });
    });
  };

  return (
    <div className="bg-white px-4 py-2 border-b border-gray-300">
      <label className="text-sm cursor-pointer">
        Upload Asset
        <input type="file" accept="video/*,audio/*" multiple hidden onChange={handleUpload} />
      </label>
    </div>
  );
}
