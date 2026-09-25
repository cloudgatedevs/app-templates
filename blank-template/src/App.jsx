import { BrowserRouter, Route } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Store } from 'lucide-react';
import { CloudgateBackoffice } from '@cloudgatedevs/cloudgate-client/react';
import { cloudgate } from './services/cloudgate';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Home } from './pages/Home';
import metadata from '../template.json';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, group: 'Workspace' },
  { id: 'commerce', label: 'Commerce', icon: Store, defaultExpanded: true, children: [
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
  ] },
];

// Add your application's routes and navigation here. Shared features update through npm.
export const App = () => <BrowserRouter>
  <CloudgateBackoffice client={cloudgate} metadata={metadata} navigation={navigation} fallback="/" basePath="/backoffice" publicHome={<Home />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/orders" element={<Orders />} />
  </CloudgateBackoffice>
</BrowserRouter>;
