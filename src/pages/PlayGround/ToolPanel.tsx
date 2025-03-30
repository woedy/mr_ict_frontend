import React, { useState } from 'react';

const ToolPanel = ({ 
  selectedTool, 
  onSelectTool, 
  onCut, 
  onCrop,
  cropSettings,
  onChangeCropSettings,
  onExport
}) => {
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(10);

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Tools</h2>
      
      <div className="flex space-x-2 mb-4">
        <button 
          className={`px-3 py-1 rounded ${selectedTool === 'cut' ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => onSelectTool('cut')}
        >
          Cut
        </button>
        <button 
          className={`px-3 py-1 rounded ${selectedTool === 'crop' ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => onSelectTool('crop')}
        >
          Crop
        </button>
      </div>
      
      {selectedTool === 'cut' && (
        <div className="mb-4">
          <div className="mb-2">
            <label className="block text-sm mb-1">Start Time (s)</label>
            <input 
              type="number" 
              min="0"
              value={cutStart} 
              onChange={(e) => setCutStart(Number(e.target.value))}
              className="w-full bg-gray-700 px-2 py-1 rounded"
            />
          </div>
          
          <div className="mb-2">
            <label className="block text-sm mb-1">End Time (s)</label>
            <input 
              type="number"
              min="0"
              value={cutEnd} 
              onChange={(e) => setCutEnd(Number(e.target.value))}
              className="w-full bg-gray-700 px-2 py-1 rounded"
            />
          </div>
          
          <button 
            className="w-full bg-green-600 py-2 rounded"
            onClick={() => onCut(cutStart, cutEnd)}
          >
            Create Cut
          </button>
        </div>
      )}
      
      {selectedTool === 'crop' && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm mb-1">X (%)</label>
              <input 
                type="number" 
                min="0" max="100"
                value={cropSettings.x} 
                onChange={(e) => onChangeCropSettings({...cropSettings, x: Number(e.target.value)})}
                className="w-full bg-gray-700 px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Y (%)</label>
              <input 
                type="number" 
                min="0" max="100"
                value={cropSettings.y} 
                onChange={(e) => onChangeCropSettings({...cropSettings, y: Number(e.target.value)})}
                className="w-full bg-gray-700 px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Width (%)</label>
              <input 
                type="number" 
                min="1" max="100"
                value={cropSettings.width} 
                onChange={(e) => onChangeCropSettings({...cropSettings, width: Number(e.target.value)})}
                className="w-full bg-gray-700 px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Height (%)</label>
              <input 
                type="number" 
                min="1" max="100"
                value={cropSettings.height} 
                onChange={(e) => onChangeCropSettings({...cropSettings, height: Number(e.target.value)})}
                className="w-full bg-gray-700 px-2 py-1 rounded"
              />
            </div>
          </div>
          
          <button 
            className="w-full bg-green-600 py-2 rounded"
            onClick={onCrop}
          >
            Apply Crop
          </button>
        </div>
      )}
      
      <button 
        className="w-full bg-blue-600 py-2 rounded mt-4"
        onClick={onExport}
      >
        Export Video
      </button>
    </div>
  );
};

export default ToolPanel;