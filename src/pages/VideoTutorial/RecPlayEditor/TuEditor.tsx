import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import axios from 'axios';






const handleEditorChange = (value, event) => {
  console.log('Editor Content:', value);
  //sendSnapshotNow();
};

const TuEditor = () => {
    return (
      <main className="flex-1 bg-gray-900 text-black">
      <Editor
        defaultLanguage="html" // Set the default language to HTML
        defaultValue="<!-- Write your HTML code here -->"
        onChange={handleEditorChange}
        theme='vs-dark'
        //onMount={handleEditorDidMount}
      />
    </main>
    );
  };
  
  export default TuEditor;
  