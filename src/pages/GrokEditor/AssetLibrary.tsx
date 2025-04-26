import useEditorStore from './_store/editorStore';
import DraggableAsset from './DraggableAsset';

export default function AssetLibrary() {
  const assets = useEditorStore((s) => s.assets);

  return (
    <div className="p-4">
      <p className="text-sm font-semibold mb-2">📁 Assets</p>
      <div className="flex flex-col gap-3">
        {assets.map((asset, index) => (
          <DraggableAsset key={index} asset={asset} />
        ))}
      </div>
    </div>
  );
}