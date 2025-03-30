import React, { useState } from 'react';

const CodePanel = ({ activeSnippet, onAddSnippet, onUpdateSnippet, currentTime }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  
  // When active snippet changes, update editor content
  React.useEffect(() => {
    if (activeSnippet) {
      setCode(activeSnippet.code);
      setLanguage(activeSnippet.language);
    }
  }, [activeSnippet]);
  
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    // If editing an active snippet, update it
    if (activeSnippet) {
      onUpdateSnippet(activeSnippet.id, { code: newCode });
    }
  };
  
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // If editing an active snippet, update it
    if (activeSnippet) {
      onUpdateSnippet(activeSnippet.id, { language: newLanguage });
    }
  };
  
  const handleAddSnippet = () => {
    if (code.trim()) {
      onAddSnippet(code, language);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold">
          {activeSnippet 
            ? `Editing Snippet (${formatTime(activeSnippet.startTime)} - ${formatTime(activeSnippet.endTime)})` 
            : 'New Code Snippet'}
        </h2>
        {!activeSnippet && (
          <button 
            className="px-3 py-1 bg-blue-600 rounded"
            onClick={handleAddSnippet}
          >
            Add at {formatTime(currentTime)}
          </button>
        )}
      </div>
      
      <div className="flex space-x-2 mb-2">
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="bg-gray-700 rounded px-2 py-1"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="java">Java</option>
        </select>
        
        {activeSnippet && (
          <div className="flex space-x-2">
            <button 
              className="px-2 py-1 bg-gray-600 rounded text-xs"
              onClick={() => onUpdateSnippet(activeSnippet.id, { 
                startTime: currentTime 
              })}
            >
              Set Start
            </button>
            <button 
              className="px-2 py-1 bg-gray-600 rounded text-xs"
              onClick={() => onUpdateSnippet(activeSnippet.id, { 
                endTime: currentTime 
              })}
            >
              Set End
            </button>
          </div>
        )}
      </div>
      
      <textarea
        value={code}
        onChange={handleCodeChange}
        className="w-full h-40 bg-gray-900 text-green-400 font-mono p-2 rounded"
        placeholder="Enter your code here..."
      />
    </div>
  );
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default CodePanel;