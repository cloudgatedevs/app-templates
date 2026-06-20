// App shell — sidebar navigation.
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { idpAuthConfig, getProfileDisplayName, useAuthContext } from '@/auth';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { APP_NAME } from '@/services/config';

/* ---- Logo mark (matches /public/favicon.svg) ---- */
function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#cgGrad)" />
      <g stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.95">
        <path d="M20 13.5 L12.8 26 M20 13.5 L27.2 26" />
      </g>
      <g fill="#ffffff">
        <circle cx="20" cy="13" r="3.4" />
        <circle cx="12.4" cy="27" r="3.4" />
        <circle cx="27.6" cy="27" r="3.4" />
      </g>
    </svg>
  );
}

/* ---- Nav icons (inherit currentColor) ---- */
const ic = 'h-[18px] w-[18px]';
const I = {
  dashboard: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  leads: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  pipeline: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="5" height="13" rx="1.2" /><rect x="9.5" y="4" width="5" height="9" rx="1.2" /><rect x="16" y="4" width="5" height="16" rx="1.2" />
    </svg>
  ),
  companies: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="11" height="18" rx="1.5" /><path d="M14 8h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6" />
      <path d="M6.5 7h3M6.5 11h3M6.5 15h3M17 12h1M17 16h1" />
    </svg>
  ),
  contacts: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="11" r="2.4" />
      <path d="M5.5 17a3.5 3.5 0 0 1 7 0M15 9h3M15 13h3" />
    </svg>
  ),
  tasks: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M8 12.5l2.5 2.5L16 9" />
    </svg>
  ),
  campaigns: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  ),
  settings: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: I.dashboard },
  { to: '/leads', label: 'Leads', icon: I.leads },
  { to: '/pipeline', label: 'Pipeline', icon: I.pipeline },
  { to: '/companies', label: 'Companies', icon: I.companies },
  { to: '/contacts', label: 'Contacts', icon: I.contacts },
  { to: '/tasks', label: 'Tasks', icon: I.tasks },
  { to: '/campaigns', label: 'Campaigns', icon: I.campaigns },
  { to: '/settings', label: 'Settings', icon: I.settings },
];

function initialsFrom(user) {
  const a = (user?.name || '').trim()[0] || '';
  const b = (user?.surname || '').trim()[0] || '';
  const fallback = (user?.emailAddress || 'U').trim()[0] || 'U';
  return (a + b || fallback).toUpperCase();
}

function SidebarUser() {
  const { auth, headerUser, logout } = useAuthContext();
  const [open, setOpen] = useState(false);
  const user = headerUser?.user;

  if (!auth) {
    return (
      <a
        href={idpAuthConfig.enabled ? idpAuthConfig.buildLoginUrl() : '#'}
        className="flex items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
      >
        Sign in
      </a>
    );
  }

  const displayName = getProfileDisplayName({
    name: user?.name,
    surname: user?.surname,
    email: user?.emailAddress,
  });

  return (
    <div className="relative">
      {open && (
        <div
          className="animate-overlay absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
            Profile
          </Link>
          <button type="button" onClick={() => logout(true)} className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50">
            Sign out
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-white/10"
      >
        {user?.photoUrl ? (
          <img src={user.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {initialsFrom(user)}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">{displayName}</span>
          <span className="block truncate text-xs text-slate-400">{user?.emailAddress}</span>
        </span>
        <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function Sidebar({ className = '', onNavigate }) {
  return (
    <aside className={`flex w-64 shrink-0 flex-col bg-[#0f172a] ${className}`}>
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="text-[15px] font-semibold tracking-tight text-white">{APP_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <SidebarUser />
      </div>
    </aside>
  );
}

const Layout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full w-full">
      <AnimatedBackground />

      {/* Desktop sidebar */}
      <Sidebar className="sticky top-0 hidden h-screen md:flex" />

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="animate-overlay fixed inset-0 z-30 bg-slate-900/50 md:hidden" onClick={() => setMobileOpen(false)} />
          <Sidebar className="fixed inset-y-0 left-0 z-40 h-full md:hidden" onNavigate={() => setMobileOpen(false)} />
        </>
      )}

      {/* Main column */}
      <div className="flex min-h-full min-w-0 grow flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-sm font-semibold text-slate-900">{APP_NAME}</span>
          </Link>
          <span className="w-7" />
        </header>

        <main className="mx-auto w-full max-w-7xl grow px-4 py-8 md:px-8">
          <div key={location.pathname} className="animate-page">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-slate-200">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 text-center text-xs text-slate-400 md:px-8">
            {APP_NAME} · Powered by Cloudgate APIs
          </div>
        </footer>
      </div>
    </div>
  );
};

export { Layout };
