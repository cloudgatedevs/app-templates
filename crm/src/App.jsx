// CRM application routes.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/auth';
import { Layout } from '@/components/Layout';
import { ToastProvider } from '@/components/Toast';
import { Home } from '@/pages/Home';
import { Profile } from '@/pages/Profile';
import { Leads } from '@/pages/Leads';
import { LeadDetail } from '@/pages/LeadDetail';
import { Pipeline } from '@/pages/Pipeline';
import { Companies } from '@/pages/Companies';
import { Contacts } from '@/pages/Contacts';
import { Tasks } from '@/pages/Tasks';
import { Campaigns } from '@/pages/Campaigns';
import { Settings } from '@/pages/Settings';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/leads/:id" element={<LeadDetail />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/settings" element={<Settings />} />
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
