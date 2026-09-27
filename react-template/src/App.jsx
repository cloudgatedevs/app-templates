import { BrowserRouter, Navigate, Route } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { CloudgateBackoffice } from '@cloudgatedevs/cloudgate-client-react/react';
import { cloudgate } from './services/cloudgate';
import { ExamplePage } from './pages/ExamplePage';
import { Home } from './pages/Home';
import metadata from '../template.json';

const navigation = [
  { to: '/example', label: 'Example page', icon: FileText, group: 'Workspace' },
];

// Add your application's routes and navigation here. Shared features update through npm.
export const App = () => <BrowserRouter>
  <CloudgateBackoffice client={cloudgate} metadata={metadata} navigation={navigation} fallback="/example" basePath="/backoffice" publicHome={<Home />}>
    <Route path="/" element={<Navigate to="example" replace />} />
    <Route path="/example" element={<ExamplePage />} />
  </CloudgateBackoffice>
</BrowserRouter>;
