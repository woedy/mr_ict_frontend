import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import Dashboard from './pages/Dashboard/Dashboard';
import DefaultLayout from './layout/DefaultLayout';
import SignUp from './pages/Authentication/SignUp';
import SignIn from './pages/Authentication/SignIn';
import VerifyUser from './pages/Authentication/VerifyUser.tsx';
import Lessons from './pages/Courses/Lessons.tsx';
import AllCourses from './pages/Courses/AllCourses.tsx';
import RecordedCourseLessons from './pages/RecordedVideos/RecordedCourseLessons.tsx';
import RecordLessonPage from './pages/RecordLesson/RecordLessonPage.tsx';
import RecordVideoPlayer from './pages/RecordedVideos/VideoPlayer/RecordVideoPlayer.tsx';
import CodeEditorWithExternalFiles from './pages/Projects/ExternalCode.tsx';
import EditorLayout from './pages/GPTEditor/EditorLayout.tsx';
import CourseChallenges from './pages/Courses/CourseChallenges.tsx';
import Challenges from './pages/Courses/Challenges.tsx';
import AllMyCourses from './pages/MyCourses/AllMyCourses.tsx';

const hiddenOnRoutes = [
  '/',
  '/signup',
  '/verify-user',

  '/record-lesson-page',
  '/recorded-course-lessons',
  '/record-player',

  '/external-editor',

  '/gpt-editor',
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
          path="/all-courses"
          element={
            <>
              <PageTitle title="All Course - <Mr ICT />" />
              <AllCourses />
            </>
          }
        />

        <Route
          path="/lessons"
          element={
            <>
              <PageTitle title="Lessons - <Mr ICT />" />
              <Lessons />
            </>
          }
        />

        <Route
          path="/course-challenges"
          element={
            <>
              <PageTitle title="Course Challenges - <Mr ICT />" />
              <CourseChallenges />
            </>
          }
        />

        <Route
          path="/challenges"
          element={
            <>
              <PageTitle title="Challenges - <Mr ICT />" />
              <Challenges />
            </>
          }
        />

<Route
          path="/all-my-courses"
          element={
            <>
              <PageTitle title="My Courses - <Mr ICT />" />
              <AllMyCourses />
            </>
          }
        />




      </Routes>
    </DefaultLayout>
  ) : (
    <>
      <Routes>
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
          path="/recorded-course-lessons"
          element={
            <>
              <PageTitle title="All Course - <Mr ICT />" />
              <RecordedCourseLessons />
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
          path="/external-editor"
          element={
            <>
              <PageTitle title="External Editor | <Mr ICT />" />
              <CodeEditorWithExternalFiles />
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
