import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ChartNoAxesCombined,
  Palette,
  PanelTop,
  Mail,
  Images,
  Activity,
  Info,
  Wallet,
  Bell,
} from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, group: 'Workspace' },
  { to: '/orders', label: 'Orders', icon: ShoppingBag, group: 'Workspace' },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined, group: 'Workspace' },
  { to: '/users', label: 'User management', icon: Users, group: 'Administration' },
  { to: '/notifications', label: 'Notifications', icon: Bell, group: 'Workspace' },
  { to: '/payments', label: 'Payments', icon: Wallet, group: 'Administration' },
  { to: '/media', label: 'Media server', icon: Images, group: 'Administration' },
  { to: '/logs', label: 'Logs', icon: Activity, group: 'Administration' },
  { to: '/appearance', label: 'Appearance', icon: PanelTop, group: 'Settings' },
  { to: '/theme', label: 'Theme styling', icon: Palette, group: 'Settings' },
  { to: '/smtp', label: 'SMTP settings', icon: Mail, group: 'Settings' },
  { to: '/about', label: 'About us', icon: Info, group: 'Settings' },
];
export const routeTitle = (path) =>
  path === '/profile'
    ? 'My account'
    : NAV.find((item) => (item.end ? path === item.to : path === item.to || path.startsWith(`${item.to}/`)))
        ?.label || 'Back office';
export const backTargetFor = (path) => (path === '/profile' ? '/' : null);
