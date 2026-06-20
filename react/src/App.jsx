import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/auth';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { Profile } from '@/pages/Profile';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export { App };
