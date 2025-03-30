// src/App.jsx
import React from 'react';
import EdStatusBar from './EdStatus';
import EdHeader from './EdHeader';
import EdSidebar from './EdSideBar';
import EdEditor from './EdEditor';


const LessonPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <EdHeader />
      <div className="flex flex-1">
        <EdSidebar />
        <EdEditor />
      </div>
      <EdStatusBar />
    </div>
  );
};

export default LessonPage;
