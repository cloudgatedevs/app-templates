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
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="13" fill="url(#cgGrad)" />
      <g fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14c-2.2-1.6-4.8-2.2-7.6-2.2-.9 0-1.4.5-1.4 1.3v12.2c0 .8.6 1.2 1.5 1.2 2.6 0 5.3.6 7.5 2" />
        <path d="M20 14c2.2-1.6 4.8-2.2 7.6-2.2.9 0 1.4.5 1.4 1.3v12.2c0 .8-.6 1.2-1.5 1.2-2.6 0-5.3.6-7.5 2" />
        <path d="M20 14v14.5" />
      </g>
      <circle cx="20" cy="9.6" r="2.1" fill="#fb7185" />
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
  courses: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  ),
  learning: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  quizzes: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  ),
  certificates: (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: I.dashboard },
  { to: '/courses', label: 'Courses', icon: I.courses },
  { to: '/learning', label: 'My Learning', icon: I.learning },
  { to: '/quizzes', label: 'Quizzes', icon: I.quizzes },
  { to: '/certificates', label: 'Certificates', icon: I.certificates },
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
        className="flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200/60"
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
        className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-slate-200/60"
      >
        {user?.photoUrl ? (
          <img src={user.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {initialsFrom(user)}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-900">{displayName}</span>
          <span className="block truncate text-xs text-slate-500">{user?.emailAddress}</span>
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
    <aside className={`flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white ${className}`}>
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-[17px] font-semibold tracking-tight text-slate-900">{APP_NAME}</span>
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
                isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
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
