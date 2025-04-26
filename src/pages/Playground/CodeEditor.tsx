
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { fetchProject, fetchProjectFiles, updateFile } from './api';

const CodeEditor = () => {
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeContent, setActiveContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const iframeRef = useRef(null);
  
  // Fetch project and files on component mount
  useEffect(() => {


    const loadProject = async () => {
    
      try {
        const projectResponse = await fetchProject(1);
        setProject(projectResponse.data);
        
        const filesResponse = await fetchProjectFiles(1);
        setFiles(filesResponse.data);
        
        // Set default active file to index.html
        const htmlFile = filesResponse.data.find(file => file.name === 'index.html');
        if (htmlFile) {
          setActiveFile(htmlFile);
          setActiveContent(htmlFile.content);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      }
    };
    
    
      loadProject();
    
  }, [1]);
  
  // Update preview when files change
  useEffect(() => {
    if (files.length > 0) {
      updatePreview();
    }
  }, [files]);
  
  // Function to handle file selection
  const handleFileSelect = (file) => {
    if (!isSaved) {
      if (window.confirm('You have unsaved changes. Do you want to save them before switching files?')) {
        handleSave();
      }
    }
    
    setActiveFile(file);
    setActiveContent(file.content);
  };
  
  // Handle editor content change
  const handleEditorChange = (value) => {
    setActiveContent(value);
    setIsSaved(false);
  };
  
  // Save file content to database
  const handleSave = async () => {
    if (!activeFile) return;
    
    setIsSaving(true);
    try {
      await updateFile(activeFile.id, activeContent);
      
      // Update local state
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === activeFile.id ? { ...file, content: activeContent } : file
        )
      );
      
      setIsSaved(true);
      updatePreview();
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Get language for editor based on file type
  const getLanguage = (fileType) => {
    switch (fileType) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      default: return 'plaintext';
    }
  };
  
  // Update the preview iframe
  const updatePreview = () => {
    const iframe = iframeRef.current;
    if (!iframe || files.length === 0) return;
    
    const htmlFile = files.find(file => file.name === 'index.html');
    const cssFile = files.find(file => file.name === 'styles.css');
    const jsFile = files.find(file => file.name === 'scripts.js');
    
    if (!htmlFile) return;
    
    // Process HTML to include CSS and JS
    let processedHtml = htmlFile.content;
    
    if (cssFile) {
      processedHtml = processedHtml.replace(
        '<link rel="stylesheet" href="styles.css">',
        `<style>${cssFile.content}</style>`
      );
    }
    
    if (jsFile) {
      processedHtml = processedHtml.replace(
        '<script src="scripts.js"></script>',
        `<script>${jsFile.content}</script>`
      );
    }
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(processedHtml);
    iframeDoc.close();
  };
  
  return (
    <div className="flex flex-col h-screen ">
      {/* Header */}
      <div className="bg-gray-800 text-black p-4">
        <h1 className="text-xl">{project?.title || 'Loading...1'}</h1>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 border-r">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Files</h2>
            <ul>
              {files.map(file => (
                <li key={file.id}>
                  <button
                    className={`w-full text-left p-2 my-1 rounded ${activeFile?.id === file.id ? 'bg-blue-500 text-black' : 'hover:bg-gray-200'}`}
                    onClick={() => handleFileSelect(file)}
                  >
                    {file.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Editor and Preview */}
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Editor */}
          <div className="lg:w-1/2 flex flex-col h-full border-r">
            {activeFile && (
              <>
                <div className="flex justify-between items-center p-2 bg-gray-200">
                  <span className="font-medium">{activeFile.name}</span>
                  <button
                    className={`px-4 py-1 rounded ${
                      isSaved ? 'bg-gray-300' : 'bg-blue-500 text-black'
                    }`}
                    onClick={handleSave}
                    disabled={isSaved || isSaving}
                  >
                    {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={getLanguage(activeFile.file_type)}
                    value={activeContent}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Preview */}
          <div className="lg:w-1/2 h-full bg-white">
            <div className="p-2 bg-gray-200">
              <span className="font-medium">Preview</span>
              <button
                className="ml-2 px-4 py-1 rounded bg-green-500 text-black"
                onClick={updatePreview}
              >
                Run
              </button>
            </div>
            <div className="h-full">
              <iframe
                ref={iframeRef}
                title="preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-modals"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
