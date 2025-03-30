// src/layouts/LessonPageLayout.tsx
import React, { ReactNode } from 'react';

interface LessonPageLayoutProps {
  children: ReactNode;
}

const LessonPageLayout: React.FC<LessonPageLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen">
      <main>
        <div className="">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LessonPageLayout;
