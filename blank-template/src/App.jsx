import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/auth';
import { RequireAdmin } from '@/auth/RequireAdmin';
import { SettingsProvider } from '@/settings/SettingsProvider';
import { NotificationsProvider } from '@/notifications/NotificationsProvider';
import { ScreenLoader } from '@/components/ScreenLoader';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Orders } from '@/pages/Orders';
import { Profile } from '@/pages/Profile';

const load = (file, name) => lazy(() => file().then((module) => ({ default: module[name] })));
const UserManagement = load(() => import('@/pages/UserManagement'), 'UserManagement');
const Analytics = load(() => import('@/pages/Analytics'), 'Analytics');
const Appearance = load(() => import('@/pages/Appearance'), 'Appearance');
const Smtp = load(() => import('@/pages/Smtp'), 'Smtp');
const Media = load(() => import('@/pages/Media'), 'Media');
const Payments = load(() => import('@/pages/Payments'), 'Payments');
const Logs = load(() => import('@/pages/Logs'), 'Logs');
const Notifications = load(() => import('@/pages/Notifications'), 'Notifications');
const About = load(() => import('@/pages/About'), 'About');
const Workspace = () => (
  <SettingsProvider>
    <NotificationsProvider>
      <Suspense fallback={<ScreenLoader />}>
        <Outlet />
      </Suspense>
    </NotificationsProvider>
  </SettingsProvider>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route element={<RequireAdmin />}>
            <Route element={<Workspace />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/sample-users" element={<Navigate to="/users" replace />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/appearance" element={<Appearance key="appearance" />} />
                <Route path="/theme" element={<Appearance key="theme" theme />} />
                <Route path="/smtp" element={<Smtp />} />
                <Route path="/media" element={<Media />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/about" element={<About />} />
                <Route path="/settings" element={<Navigate to="/appearance" replace />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export { App };
