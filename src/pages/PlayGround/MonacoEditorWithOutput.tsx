import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import RecDraggableWindow from '../VideoTutorial/RecLesson/RecDraggableWindow';

const MonacoEditorWithOutput = () => {
  const [code, setCode] = useState('console.log("Hello, World!");');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('vs-dark');
  const [runtimes, setRuntimes] = useState([]);
  const [isLoadingRuntimes, setIsLoadingRuntimes] = useState(true);
  const editorRef = useRef(null);
  const [showPreviewWindow, setShowPreviewWindow] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState('<h1>HTML Preview</h1><p>Run your HTML code to see the preview</p>');

  // Initial language options for UI (will be updated with runtime info)
  const languageUI = [
    { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
    { value: 'python', label: 'Python', monacoLang: 'python' },
    { value: 'java', label: 'Java', monacoLang: 'java' },
    { value: 'c', label: 'C', monacoLang: 'c' },
    { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
    { value: 'csharp', label: 'C#', monacoLang: 'csharp' },
    { value: 'php', label: 'PHP', monacoLang: 'php' },
    { value: 'ruby', label: 'Ruby', monacoLang: 'ruby' },
    { value: 'go', label: 'Go', monacoLang: 'go' },
    { value: 'rust', label: 'Rust', monacoLang: 'rust' },
    { value: 'html', label: 'HTML', monacoLang: 'html' }
  ];

  // Sample default code for different languages
  const defaultCode = {
    javascript: 'console.log("Hello, World!");',
    python: 'print("Hello, World!")',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    php: '<?php\necho "Hello, World!";\n?>',
    ruby: 'puts "Hello, World!"',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    rust: 'fn main() {\n    println!("Hello, World!");\n}',
    html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 0;\n            padding: 20px;\n            background-color: #f0f0f0;\n        }\n        h1 {\n            color: #333;\n        }\n        .container {\n            background-color: white;\n            padding: 20px;\n            border-radius: 5px;\n            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>Hello, World!</h1>\n        <p>This is a simple HTML page.</p>\n        <button onclick="alert(\'Button clicked!\')">Click Me</button>\n    </div>\n</body>\n</html>'
  };

  // Map our language values to Piston language names
  const languageMap = {
    javascript: ['javascript', 'js', 'node', 'nodejs'],
    python: ['python', 'py', 'python3'],
    java: ['java'],
    c: ['c'],
    cpp: ['cpp', 'c++'],
    csharp: ['csharp', 'cs', 'dotnet'],
    php: ['php'],
    ruby: ['ruby'],
    go: ['go', 'golang'],
    rust: ['rust'],
    html: ['html']
  };

  // When the component mounts and language is HTML, set the initial HTML output
  useEffect(() => {
    if (language === 'html') {
      setHtmlOutput(code);
    }
  }, []);

  // Fetch available runtimes from Piston API
  useEffect(() => {
    const fetchRuntimes = async () => {
      try {
        const response = await fetch('https://emkc.org/api/v2/piston/runtimes');
        if (response.ok) {
          const data = await response.json();
          console.log('Available runtimes:', data);
          setRuntimes(data);
        } else {
          console.error('Failed to fetch runtimes');
        }
      } catch (error) {
        console.error('Error fetching runtimes:', error);
      } finally {
        setIsLoadingRuntimes(false);
      }
    };

    fetchRuntimes();
  }, []);

  // Find the appropriate runtime for a language
  const findRuntime = (languageValue) => {
    if (languageValue === 'html') {
      return null; // HTML is handled locally
    }

    const possibleNames = languageMap[languageValue] || [languageValue];
    
    // Look for an exact match first
    for (const name of possibleNames) {
      const exactMatch = runtimes.find(r => r.language === name);
      if (exactMatch) {
        return {
          language: exactMatch.language,
          version: exactMatch.version
        };
      }
    }
    
    // If no exact match, try to find a runtime that contains our language name
    for (const name of possibleNames) {
      const partialMatch = runtimes.find(r => 
        r.language.includes(name) || name.includes(r.language)
      );
      if (partialMatch) {
        return {
          language: partialMatch.language,
          version: partialMatch.version
        };
      }
    }
    
    return null;
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    const newCode = defaultCode[newLanguage] || '';
    setCode(newCode);
    
    // If switching to HTML, update the HTML output and show the preview
    if (newLanguage === 'html') {
      setHtmlOutput(newCode);
      setShowPreviewWindow(true);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
    
    // Auto-update HTML preview if live preview is enabled
    // This could be toggled with a checkbox if you want
    if (language === 'html') {
      setHtmlOutput(value || '');
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setError(null);

    // Special case for HTML - render directly in the draggable window
    if (language === 'html') {
      setHtmlOutput(code);
      setOutput(code);
      setShowPreviewWindow(true);
      setIsLoading(false);
      return;
    }

    try {
      // Find the appropriate runtime
      const runtime = findRuntime(language);
      
      if (!runtime) {
        throw new Error(`No suitable runtime found for ${language}`);
      }

      console.log(`Using runtime: ${runtime.language} (${runtime.version})`);

      // Prepare the request payload
      const payload = {
        language: runtime.language,
        version: runtime.version,
        files: [
          {
            name: "main",
            content: code
          }
        ]
      };

      console.log('Sending request to Piston API:', payload);

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response from Piston API:', data);
      
      if (response.ok) {
        // Parse the response
        if (data.run) {
          const result = [
            data.run.stdout || '',
            data.run.stderr || ''
          ].filter(Boolean).join('\n');
          
          setOutput(result || '(No output)');
        } else if (data.output) {
          setOutput(data.output);
        } else {
          setOutput(JSON.stringify(data, null, 2));
        }
      } else {
        setError(`Error: ${data.message || 'Unknown error'}`);
        setOutput(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError('Error: ' + err.message);
      console.error('Error executing code:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark');
  };

  // Get Monaco language for the editor
  const getMonacoLanguage = () => {
    const langOption = languageUI.find(l => l.value === language);
    return langOption ? langOption.monacoLang : language;
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Code Editor</h1>
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languageUI.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleTheme}
            className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm"
          >
            Toggle Theme
          </button>
          <button
            onClick={handleRunCode}
            disabled={isLoading || isLoadingRuntimes}
            className={`px-4 py-2 ${
              isLoading || isLoadingRuntimes 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-500'
            } text-white rounded transition text-sm flex items-center`}
          >
            {isLoadingRuntimes 
              ? 'Loading...' 
              : isLoading 
                ? 'Running...' 
                : 'Run Code'}
          </button>
          {language === 'html' && (
            <button
              onClick={() => setShowPreviewWindow(!showPreviewWindow)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition text-sm"
            >
              {showPreviewWindow ? 'Hide Preview' : 'Show Preview'}
            </button>
          )}
        </div>
      </div>

      {isLoadingRuntimes && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading available language runtimes...
        </div>
      )}

      <div className="flex flex-1 space-x-4 overflow-hidden">
        {/* Editor Panel */}
        <div className="w-1/2 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 font-mono flex items-center">
            <span className="capitalize">{language} Editor</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={getMonacoLanguage()}
              value={code}
              theme={theme}
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

        {/* Output Panel */}
        <div className="w-1/2 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 font-mono">
            <span>Output</span>
          </div>
          <div className="flex-1 overflow-auto">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-2">
                {error}
              </div>
            )}
            
            {language !== 'html' && (
              <pre className="p-4 font-mono text-sm whitespace-pre-wrap h-full bg-gray-50">
                {output}
              </pre>
            )}
            
            {language === 'html' && !showPreviewWindow && (
              <div className="p-4">
                <p className="text-gray-500">
                  HTML preview is displayed in the separate window. 
                  <button 
                    onClick={() => setShowPreviewWindow(true)} 
                    className="ml-2 text-blue-500 underline"
                  >
                    Show Preview
                  </button>
                </p>
                <pre className="p-4 font-mono text-sm whitespace-pre-wrap mt-4 bg-gray-50 border rounded">
                  {output || code}
                </pre>
              </div>
            )}
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

export default MonacoEditorWithOutput;