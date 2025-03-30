// src/App.jsx
import React from 'react';
import TuHeader from './TuHeader';
import TuSidebar from './TuSideBar';
import TuEditor from './TuEditor';
import TuStatusBar from './TuStatus';

const TutorialPage = ({value, onEditorInteraction}) => {
  return (
    <div className="flex flex-col h-screen">
      <TuHeader />
      <div className="flex flex-1">
        <TuSidebar />
        <TuEditor value={value} onEditorInteraction={onEditorInteraction}/>
      </div>
      <TuStatusBar />
    </div>
  );
};

export default TutorialPage;
