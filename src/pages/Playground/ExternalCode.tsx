import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditorWithExternalFiles = () => {
  // Initial content for our files
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
  <title>My Web Page</title>
  <!-- CSS will be imported here -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Hello Monaco Editor!</h1>
    <p>This example imports external CSS and JS files.</p>
    <button id="btnClick">Click me!</button>
  </div>

  <!-- JavaScript will be imported here -->
  <script src="scripts.js"></script>
</body>
</html>`);

  const [cssContent, setCssContent] = useState(`/* styles.css */
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
}
.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
h1 {
  color: #0070f3;
}
button {
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0051a2;
}`);

  const [jsContent, setJsContent] = useState(`// scripts.js
document.getElementById('btnClick').addEventListener('click', function() {
  alert('Button clicked from external JS file!');
});

// You can define more complex functionality here
function changeHeadingColor() {
  const heading = document.querySelector('h1');
  const colors = ['#0070f3', '#ff0000', '#00ff00', '#ff00ff', '#ffff00'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  heading.style.color = randomColor;
}

// Additional initialization if needed
console.log('External JS file loaded successfully!');`);




  const [activeTab, setActiveTab] = useState('html');
  const iframeRef = useRef(null);

  // Function to combine all content and update the preview
  const updatePreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Create a combined HTML document that includes the CSS and JS inline
    // This simulates the external files being imported
    const combinedHtml = htmlContent
      .replace('<link rel="stylesheet" href="styles.css">', `<style>${cssContent}</style>`)
      .replace('<script src="scripts.js"></script>', `<script>${jsContent}</script>`);
    
    iframeDoc.open();
    iframeDoc.write(combinedHtml);
    iframeDoc.close();
  };

  // Update preview when any content changes
  useEffect(() => {
    updatePreview();
  }, [htmlContent, cssContent, jsContent]);

  // Handle content changes based on active tab
  const handleEditorChange = (value) => {
    switch (activeTab) {
      case 'html':
        setHtmlContent(value);
        break;
      case 'css':
        setCssContent(value);
        break;
      case 'js':
        setJsContent(value);
        break;
      default:
        break;
    }
  };

  // Current editor content based on active tab
  const getCurrentContent = () => {
    switch (activeTab) {
      case 'html':
        return htmlContent;
      case 'css':
        return cssContent;
      case 'js':
        return jsContent;
      default:
        return '';
    }
  };

  // Current language for Monaco Editor
  const getCurrentLanguage = () => {
    switch (activeTab) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
        return 'javascript';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 p-4">
      {/* Editor panel */}
      <div className="lg:w-1/2 h-1/2 lg:h-full mb-4 lg:mb-0 lg:pr-2">
        <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
          <div className="flex mb-2 border-b">
            <button 
              className={`py-2 px-4 mr-1 ${activeTab === 'html' ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700'}`}
              onClick={() => setActiveTab('html')}
            >
              index.html
            </button>
            <button 
              className={`py-2 px-4 mr-1 ${activeTab === 'css' ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700'}`}
              onClick={() => setActiveTab('css')}
            >
              styles.css
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'js' ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700'}`}
              onClick={() => setActiveTab('js')}
            >
              scripts.js
            </button>
          </div>
          
          <div className="flex-grow border border-gray-300 rounded">
            <Editor
              height="100%"
              language={getCurrentLanguage()}
              value={getCurrentContent()}
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
          
          <button 
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={updatePreview}
          >
            Run
          </button>
        </div>
      </div>

      {/* Preview panel */}
      <div className="lg:w-1/2 h-1/2 lg:h-full lg:pl-2">
        <div className="bg-white p-4 rounded-lg shadow h-full">
          <h2 className="text-lg font-semibold mb-2">Live Preview</h2>
          <div className="h-5/6 border border-gray-300 rounded bg-white overflow-hidden">
            <iframe
              ref={iframeRef}
              title="preview"
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-modals"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorWithExternalFiles;