import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/auth';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Users } from '@/pages/Users';
import { Orders } from '@/pages/Orders';
import { Profile } from '@/pages/Profile';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export { App };
