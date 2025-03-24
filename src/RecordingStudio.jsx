import React, { useState, useRef, useEffect } from 'react';
import CodeEditor from './Editor';
import ScreenRecorder from './Recorder';

const RecordingStudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTitle, setRecordingTitle] = useState('New Recording');
  const [isUploading, setIsUploading] = useState(false);
  

  
  const handleStartRecording = async () => {
    setIsRecording(true);

  };
  
  const handleStopRecording = async () => {
    setIsRecording(false);

  };
  
  
 

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Recording Studio</h1>
        <div className="flex space-x-2">
          {!isRecording ? (
            <>
              <input
                type="text"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                className="border rounded px-3 py-2"
                placeholder="Recording Title"
              />
              <button 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" 
                onClick={handleStartRecording}
              >
                Start Recording
              </button>
            </>
          ) : (
            <button 
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
              onClick={handleStopRecording}
              disabled={isUploading}
            >
              {isUploading ? 'Saving...' : 'Stop Recording'}
            </button>
          )}
        </div>
      </div>
      
      {isRecording && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4 flex items-center">
          <div className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></div>
          Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toFixed(1).padStart(4, '0')}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">



        
      <CodeEditor isRecording={isRecording} />
   
        

      <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Screen Preview</h2>
          <ScreenRecorder isRecording={isRecording} />


        </div>

      </div>

      


    </div>
  );
};

export default RecordingStudio;