// Navigation model shared by the desktop sidebar and the mobile flyout, plus
// the helpers the mobile top bar uses to title itself and decide whether the
// current route is a drill-down that deserves a back button.

export const IconDashboard = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
export const IconUsers = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-3-4.9" strokeLinecap="round" />
  </svg>
);
export const IconOrders = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M6 3h12l2 5H4l2-5z" strokeLinejoin="round" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M9 12a3 3 0 0 0 6 0" strokeLinecap="round" />
  </svg>
);
export const IconUser = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
  </svg>
);
export const IconMenu = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
  </svg>
);
export const IconClose = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" {...p}>
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);
export const IconBack = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const NAV = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/users', label: 'Users', icon: IconUsers },
  { to: '/orders', label: 'Orders', icon: IconOrders },
];

// Routes that are not top-level nav destinations: each names the title shown
// in the mobile bar and the parent to fall back to when there is no history
// to pop (e.g. the user opened a deep link directly).
const DETAIL_ROUTES = [
  { match: /^\/profile$/, title: 'My account', parent: '/' },
];

/** Title for the mobile top bar — nav label, detail title, or a fallback. */
export const routeTitle = (pathname) => {
  const nav = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));
  const detail = DETAIL_ROUTES.find((d) => d.match.test(pathname));
  return detail?.title ?? nav?.label ?? 'Admin';
};

/**
 * Where "back" should land when the history stack can't be popped.
 * null means this route is a top-level destination — show no back button.
 */
export const backTargetFor = (pathname) =>
  DETAIL_ROUTES.find((d) => d.match.test(pathname))?.parent ?? null;
