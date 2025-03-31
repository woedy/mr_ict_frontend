import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import RecDraggableWindow from '../VideoTutorial/RecLesson/RecDraggableWindow';

const MonacoEditorWithPiston = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('html');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);
  const [showPreviewWindow, setShowPreviewWindow] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState(
    '<h1>HTML Preview</h1><p>Run your HTML code to see the preview</p>',
  );

  // Sample default code for HTML
  const defaultCode = {
    html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 0;\n            padding: 20px;\n            background-color: #f0f0f0;\n        }\n        h1 {\n            color: #333;\n        }\n        .container {\n            background-color: white;\n            padding: 20px;\n            border-radius: 5px;\n            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>Hello, World!</h1>\n        <p>This is a simple HTML page.</p>\n        <button onclick="alert(\'Button clicked!\')">Click Me</button>\n    </div>\n</body>\n</html>',
  };

  // When the component mounts and language is HTML, set the initial HTML output
  useEffect(() => {
    setCode(defaultCode.html); // Set default HTML code
    setHtmlOutput(defaultCode.html); // Set the preview content
    setLanguage('html'); // Ensure language is set to HTML

    // Show preview window immediately after initialization
    setShowPreviewWindow(true);
  }, []);

  // Handle the change of code in the editor
  const handleEditorChange = (value) => {
    setCode(value || '');
    if (language === 'html') {
      setHtmlOutput(value || ''); // Update preview if live preview is enabled
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setError(null);

    if (language === 'html') {
      setHtmlOutput(code); // Update the preview window with the latest code
      setShowPreviewWindow(true); // Ensure the preview window is shown
      setIsLoading(false);
      return;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Code Editor</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunCode}
            disabled={isLoading}
            className={`px-4 py-2 ${
              isLoading
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500'
            } text-white rounded transition text-sm flex items-center`}
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 space-x-4 overflow-hidden">
        {/* Editor Panel */}
        <div className="w-1/2 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 font-mono flex items-center">
            <span className="capitalize">{language} Editor</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language="html"
              value={code}
              theme="vs-dark"
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* HTML Preview Window */}
      {showPreviewWindow && language === 'html' && (
        <RecDraggableWindow
          editorRef={editorRef}
          language={language}
          htmlContent={htmlOutput}
          title="HTML Preview"
        />
      )}
    </div>
  );
};

export default MonacoEditorWithPiston;
