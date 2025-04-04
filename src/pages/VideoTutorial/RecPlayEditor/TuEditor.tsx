import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import axios from 'axios';





const TuEditor = ({ value, onEditorInteraction, onChange }) => {
  const handleEditorChange = (value, event) => {
    console.log('Editor Content:', value);
    // Call the function to pause the video when user types
    if (onEditorInteraction) {
      onEditorInteraction();
      onChange(value); // Pass the updated value back
    }
  };

  return (
    <main className="flex-1 bg-gray-900 text-black">
      <Editor
        value={value}
        language="html"
        height="100%"
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          readOnly: false,
        }}
      />
    </main>
  );
};

export default TuEditor;
  