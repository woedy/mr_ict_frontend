// src/App.jsx
import React from 'react';
import TuSidebar from './TuSideBar';
import TuStatusBar from './TuStatus';
import TuHeader from './TuHeader';
import TuEditor from './TuEditor';

const TutorialPage = ({ value, onEditorInteraction, onCodeChange }) => {
  const handleEditorChange = (value) => {
    // Pass the new code back to the parent component
    onCodeChange(value);
  };

  return (
    <div className="flex flex-col h-screen">
      <TuHeader />
      <div className="flex flex-1">
        <TuSidebar />
        <TuEditor
          value={value}
          onEditorInteraction={onEditorInteraction}
          onChange={handleEditorChange}
        />
      </div>
      <TuStatusBar />
    </div>
  );
};

export default TutorialPage;
