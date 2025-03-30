import React, { useState, useRef, useEffect } from 'react';
import Timeline from './Timeline';
import ToolPanel from './ToolPanel';
import { VideoProject } from './videoProject';
import CodePanel from './CodePanel';

const PlayVideoEditor = () => {
  const [project, setProject] = useState(new VideoProject('project-1', 'New Project'));
  const [videoUrl, setVideoUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTool, setSelectedTool] = useState('cut');
  const [cropSettings, setCropSettings] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [activeCodeSnippet, setActiveCodeSnippet] = useState(null);
  
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (project.videoFile) {
      const url = URL.createObjectURL(project.videoFile);
      setVideoUrl(url);
      
      return () => URL.revokeObjectURL(url);
    }
  }, [project.videoFile]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newProject = {...project};
      newProject.videoFile = e.target.files[0];
      setProject(newProject);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Find code snippets active at current time
      const activeSnippet = project.codeSnippets.find(
        snippet => currentTime >= snippet.startTime && currentTime <= snippet.endTime
      );
      
      if (activeSnippet !== activeCodeSnippet) {
        setActiveCodeSnippet(activeSnippet || null);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const newProject = {...project};
      newProject.duration = videoRef.current.duration;
      newProject.clips = [{
        id: 'main-clip',
        start: 0,
        end: videoRef.current.duration,
        type: 'main'
      }];
      setProject(newProject);
    }
  };

  const handleCut = (start, end) => {
    const newProject = {...project};
    const newClipId = `clip-${Date.now()}`;
    const newClip = { id: newClipId, start, end, type: 'cut' };
    newProject.clips = [...newProject.clips, newClip];
    
    // Record edit operation
    const editOperation = { type: 'cut', cutStart: start, cutEnd: end };
    newProject.editHistory.push(editOperation);
    
    // Update code snippet timestamps
    newProject.updateCodeSnippetsAfterEdit(editOperation);
    
    setProject(newProject);
  };

  const handleDelete = (clipId) => {
    const clipToDelete = project.clips.find(clip => clip.id === clipId);
    
    if (clipToDelete) {
      const newProject = {...project};
      newProject.clips = project.clips.filter(clip => clip.id !== clipId);
      
      // Record edit operation
      const editOperation = { 
        type: 'delete', 
        cutStart: clipToDelete.start, 
        cutEnd: clipToDelete.end 
      };
      newProject.editHistory.push(editOperation);
      
      // Update code snippet timestamps
      newProject.updateCodeSnippetsAfterEdit(editOperation);
      
      setProject(newProject);
    }
  };

  const handleAddCodeSnippet = (code, language) => {
    if (!videoRef.current) return;
    
    const newProject = {...project};
    const startTime = currentTime;
    const endTime = Math.min(startTime + 30, project.duration); // Default 30s duration
    
    newProject.addCodeSnippet(code, language, startTime, endTime);
    setProject(newProject);
  };

  const handleUpdateCodeSnippet = (snippetId, updates) => {
    const newProject = {...project};
    const snippetIndex = newProject.codeSnippets.findIndex(s => s.id === snippetId);
    
    if (snippetIndex >= 0) {
      newProject.codeSnippets[snippetIndex] = {
        ...newProject.codeSnippets[snippetIndex],
        ...updates
      };
      setProject(newProject);
    }
  };

  const handleExport = async () => {
    if (!project.videoFile) return;
    
    const formData = new FormData();
    formData.append('video', project.videoFile);
    formData.append('clips', JSON.stringify(project.clips));
    formData.append('crop', JSON.stringify(cropSettings));
    formData.append('codeSnippets', JSON.stringify(project.codeSnippets));
    
    try {
      const response = await fetch('http://localhost:8000/api/process-video/', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Handle combined export (video + code snippets)
        const result = await response.json();
        
        // Download video
        const videoBlob = await fetch(result.videoUrl).then(r => r.blob());
        const videoUrl = URL.createObjectURL(videoBlob);
        const videoLink = document.createElement('a');
        videoLink.href = videoUrl;
        videoLink.download = 'edited_video.mp4';
        videoLink.click();
        URL.revokeObjectURL(videoUrl);
        
        // Download synchronized code snippets
        const snippetsBlob = new Blob([JSON.stringify(result.snippets)], {type: 'application/json'});
        const snippetsUrl = URL.createObjectURL(snippetsBlob);
        const snippetsLink = document.createElement('a');
        snippetsLink.href = snippetsUrl;
        snippetsLink.download = 'code_snippets.json';
        snippetsLink.click();
        URL.revokeObjectURL(snippetsUrl);
      }
    } catch (error) {
      console.error('Error exporting project:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-black">
      <div className="p-4 bg-gray-800">
        <h1 className="text-xl font-bold">Interactive Video Editor with Code Synchronization</h1>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden relative">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-full max-w-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                controls
              />
            ) : (
              <div className="text-gray-500">Upload a video to start editing</div>
            )}
          </div>
          
          <Timeline 
            duration={project.duration} 
            currentTime={currentTime}
            clips={project.clips}
            codeSnippets={project.codeSnippets}
            onDelete={handleDelete}
            onSelectClip={(id) => console.log('Selected clip:', id)}
          />
          
          <CodePanel 
            activeSnippet={activeCodeSnippet}
            onAddSnippet={handleAddCodeSnippet}
            onUpdateSnippet={handleUpdateCodeSnippet}
            currentTime={currentTime}
          />
        </div>
        
        <div className="w-full md:w-1/3 bg-gray-800 rounded-lg p-4">
          <ToolPanel 
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
            onCut={handleCut}
            onCrop={() => {/* Crop implementation */}}
            cropSettings={cropSettings}
            onChangeCropSettings={setCropSettings}
            onExport={handleExport}
          />
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Upload Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-2">Code Snippets</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {project.codeSnippets.map(snippet => (
                <div key={snippet.id} className="bg-gray-700 p-2 rounded">
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>{snippet.language}</span>
                    <span>{formatTime(snippet.startTime)} - {formatTime(snippet.endTime)}</span>
                  </div>
                  <div className="text-xs truncate">{snippet.code.substring(0, 50)}...</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default PlayVideoEditor;
