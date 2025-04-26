import { useState, useRef, useEffect } from 'react';
import useEditorStore from './_store/editorStore';

export default function ClipContextMenu({ clip, trackId, trackType, index, onClose }) {
  const {
    deleteClip,
    duplicateClip,
    splitClip,
    snapClip,
    updateClip,
    setCurrentTime
  } = useEditorStore();
  
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleDelete = () => {
    deleteClip(trackType, trackId, index);
    onClose();
  };
  
  const handleDuplicate = () => {
    duplicateClip(trackType, trackId, index);
    onClose();
  };
  
  const handleSplit = () => {
    splitClip(trackType, trackId, index);
    onClose();
  };
  
  const handleSnap = () => {
    snapClip(trackType, trackId, index);
    onClose();
  };
  
  const handleSeekTo = () => {
    setCurrentTime(clip.startTime);
    onClose();
  };
  
  const handleRename = () => {
    const newName = prompt('Enter new clip name:', clip.name);
    if (newName && newName.trim()) {
      updateClip(trackType, trackId, index, { name: newName.trim() });
    }
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="absolute z-50 bg-white rounded shadow-lg border border-gray-200 py-1 text-sm"
      style={{ width: '180px' }}
    >
      <div className="px-3 py-1 font-medium text-xs text-gray-500 border-b border-gray-100">
        {clip.name}
      </div>
      
      <button 
        className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
        onClick={handleSeekTo}
      >
        <span className="w-5 text-center mr-2">⏱️</span> 
        Seek to clip
      </button>
      
      <button 
        className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
        onClick={handleRename}
      >
        <span className="w-5 text-center mr-2">✏️</span> 
        Rename
      </button>
      
      <button 
        className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
        onClick={handleSnap}
      >
        <span className="w-5 text-center mr-2">🧲</span> 
        Snap to previous clip
      </button>
      
      <button 
        className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
        onClick={handleSplit}
      >
        <span className="w-5 text-center mr-2">✂️</span> 
        Split at playhead
      </button>
      
      <button 
        className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
        onClick={handleDuplicate}
      >
        <span className="w-5 text-center mr-2">📋</span> 
        Duplicate
      </button>
      
      <div className="border-t border-gray-100 my-1"></div>
      
      <button 
        className="w-full text-left px-3 py-1 hover:bg-red-50 text-red-600 flex items-center"
        onClick={handleDelete}
      >
        <span className="w-5 text-center mr-2">🗑️</span> 
        Delete
      </button>
    </div>
  );
}