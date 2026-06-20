// Application routes.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/auth';
import { Layout } from '@/components/Layout';
import { ToastProvider } from '@/components/Toast';
import { Home } from '@/pages/Home';
import { Profile } from '@/pages/Profile';
import { Courses } from '@/pages/Courses';
import { CourseDetail } from '@/pages/CourseDetail';
import { Enrollments } from '@/pages/Enrollments';
import { LessonPlayer } from '@/pages/LessonPlayer';
import { Quizzes } from '@/pages/Quizzes';
import { Certificates } from '@/pages/Certificates';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/learning" element={<Enrollments />} />
              <Route path="/learn/:enrollmentId" element={<LessonPlayer />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export { App };
