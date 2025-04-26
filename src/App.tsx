import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import Dashboard from './pages/Dashboard/Dashboard';
import DefaultLayout from './layout/DefaultLayout';
import SignUp from './pages/Authentication/SignUp';
import SignIn from './pages/Authentication/SignIn';
import VerifyUser from './pages/Authentication/VerifyUser.tsx';
import Course from './pages/Courses/Course.tsx';
import LessonPage from './pages/Lesson/LessonPage.tsx';
import AllCourses from './pages/Courses/AllCourses.tsx';
import CourseLessonsRecord from './pages/VideoTutorial/CourseLessonsRecord.tsx';
import RecordLessonPage from './pages/VideoTutorial/RecLesson/RecordLessonPage.tsx';
import RecordVideoPlayer from './pages/VideoTutorial/RecordVideoPlayer.tsx';
import VideoEditor from './pages/VideoEditor/VideoEditor.tsx';
import CodeEditorWithExternalFiles from './pages/Playground/ExternalCode.tsx';
import CodeEditor from './pages/Playground/CodeEditor.tsx';
import ProjectList from './pages/Playground/ProjectList.tsx';
import EditorLayout from './pages/GPTEditor/EditorLayout.tsx';

const hiddenOnRoutes = [
  '/',
  '/signup',
  '/lesson-page',
  '/record-player',
  '/video-editor',
  '/play-video-editor',
  '/record-lesson-page',
  '/verify-user',
  '/course-lesson-record',
  "/external-editor",
  "/gpt-editor",
  "/code-editor",
  "/list-projects",
];

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Determine if the current route should skip the layout
  const shouldUseDefaultLayout = !hiddenOnRoutes.includes(location.pathname);

  return loading ? (
    <Loader />
  ) : shouldUseDefaultLayout ? (
    <DefaultLayout hiddenOnRoutes={hiddenOnRoutes}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="Dashboard | <Mr ICT />" />
              <Dashboard />
            </>
          }
        />

        <Route
          path="/course"
          element={
            <>
              <PageTitle title="Course - <Mr ICT />" />
              <Course />
            </>
          }
        />
        <Route
          path="/all-courses"
          element={
            <>
              <PageTitle title="All Course - <Mr ICT />" />
              <AllCourses />
            </>
          }
        />
      </Routes>
    </DefaultLayout>
  ) : (
    <>
      <Routes>
        <Route
          path="/lesson-page"
          element={
            <>
              <PageTitle title="Lesson Page | <Mr ICT />" />
              <LessonPage />
            </>
          }
        />

        <Route
          index
          element={
            <>
              <PageTitle title="Sign In | <Mr ICT />" />
              <SignIn />
            </>
          }
        />

        <Route
          path="/signup"
          element={
            <>
              <PageTitle title="Sign Up | <Mr ICT />" />
              <SignUp />
            </>
          }
        />

        <Route
          path="/course-lesson-record"
          element={
            <>
              <PageTitle title="All Course - <Mr ICT />" />
              <CourseLessonsRecord />
            </>
          }
        />

        <Route
          path="/record-lesson-page"
          element={
            <>
              <PageTitle title="Record Lesson Page | <Mr ICT />" />
              <RecordLessonPage />
            </>
          }
        />

        <Route
          path="/verify-user/:user_email"
          element={
            <>
              <PageTitle title="Verify User | <Mr ICT />" />
              <VerifyUser />
            </>
          }
        />
        <Route
          path="/record-player"
          element={
            <>
              <PageTitle title="Record Player | <Mr ICT />" />
              <RecordVideoPlayer />
            </>
          }
        />
        <Route
          path="/video-editor"
          element={
            <>
              <PageTitle title="Video Editor | <Mr ICT />" />
              <VideoEditor />
            </>
          }
        />
        <Route
          path="/external-editor"
          element={
            <>
              <PageTitle title="External Editor | <Mr ICT />" />
              <CodeEditorWithExternalFiles />
            </>
          }
        />
        <Route
          path="/code-editor"
          element={
            <>
              <PageTitle title="Code Editor | <Mr ICT />" />
              <CodeEditor />
            </>
          }
        />
        <Route
          path="/list-projects"
          element={
            <>
              <PageTitle title="List Project Editor | <Mr ICT />" />
              <ProjectList />
            </>
          }
        />
        <Route
          path="/gpt-editor"
          element={
            <>
              <PageTitle title="GPT Editor | <Mr ICT />" />
              <EditorLayout />
            </>
          }
        />


      </Routes>
    </>
  );
}

export default App;
