import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { getProfileDisplayName } from '@/auth';
import { Brand } from './Brand';
import { NAV, IconBack, IconClose, IconMenu, IconUser, backTargetFor, routeTitle } from './navConfig';

function initialsFrom(user) {
  const a = (user?.name || '').trim()[0] || '';
  const b = (user?.surname || '').trim()[0] || '';
  const fallback = (user?.emailAddress || 'U').trim()[0] || 'U';
  return (a + b || fallback).toUpperCase();
}

const navItemClass = ({ isActive }) =>
  [
    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
    isActive
      ? 'bg-ink-800/80 text-mist shadow-[inset_0_0_0_1px_rgba(124,139,255,0.18)]'
      : 'text-mist-muted hover:bg-ink-800/50 hover:text-mist',
  ].join(' ');

/** Nav links shared by the desktop sidebar and the mobile flyout. */
const NavLinks = ({ onNavigate }) => (
  <nav className="flex flex-col gap-1">
    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-dim">Manage</p>
    {NAV.map(({ to, label, icon: Icon, end }) => (
      <NavLink key={to} to={to} end={end} onClick={onNavigate} className={navItemClass}>
        {({ isActive }) => (
          <>
            <span
              className={`absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-accent-grad transition-all ${
                isActive ? 'w-1 opacity-100' : 'w-0 opacity-0'
              }`}
            />
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

/** Signed-in user card with the sign-out action, used in both nav surfaces. */
const UserCard = ({ user, displayName, onLogout, onNavigate }) => (
  <div className="rounded-2xl border border-ink-700/60 bg-ink-850/60 p-3">
    <NavLink to="/profile" onClick={onNavigate} className="flex items-center gap-3 rounded-xl transition hover:opacity-90">
      {user?.photoUrl ? (
        <img src={user.photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-grad text-xs font-semibold text-white">
          {initialsFrom(user)}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-mist">{displayName}</p>
        <p className="truncate text-xs text-mist-dim">{user?.emailAddress}</p>
      </div>
    </NavLink>
    <button
      type="button"
      onClick={onLogout}
      className="mt-3 w-full rounded-lg border border-ink-600/70 px-3 py-2 text-xs font-medium text-mist-muted transition hover:border-red-500/40 hover:text-red-300"
    >
      Sign out
    </button>
  </div>
);

const Layout = () => {
  const { headerUser, logout } = useAuthContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  const user = headerUser?.user;
  const displayName = getProfileDisplayName({
    name: user?.name,
    surname: user?.surname,
    email: user?.emailAddress,
  });

  const title = routeTitle(location.pathname);
  const backTarget = backTargetFor(location.pathname);

  // Close the flyout whenever the route changes (tapping a link, or the OS
  // back gesture) so it never lingers over the new page.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // While the flyout is open: lock background scroll, close on Escape, and
  // move focus into the panel so keyboard and screen-reader users land there.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    drawerRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  // Pop history when there is somewhere to pop back to, otherwise walk up to
  // the section this route belongs to (deep links have no history entry).
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(backTarget ?? '/');
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden">
      {/* Desktop sidebar — fixed within the shell; only the main column scrolls */}
      <aside className="app-sidebar hidden h-full w-64 shrink-0 flex-col border-r border-ink-700/60 bg-ink-900/70 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="mt-8">
          <NavLinks />
        </div>
        <div className="mt-auto">
          <UserCard user={user} displayName={displayName} onLogout={() => logout(true)} />
        </div>
      </aside>

      {/* Mobile flyout: backdrop + slide-in panel, both animated */}
      <div className={`fixed inset-0 z-40 lg:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
          className={`absolute inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity duration-200 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          ref={drawerRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`absolute inset-y-0 left-0 app-drawer flex w-[17rem] max-w-[85vw] flex-col border-r border-ink-700/60 bg-ink-900 shadow-panel outline-none transition-transform duration-200 ease-out ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-2 px-1">
            <Brand />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-mist-muted transition hover:bg-ink-800 hover:text-mist"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 min-h-0 grow overflow-y-auto">
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
          </div>

          <div className="mt-4 shrink-0">
            <UserCard
              user={user}
              displayName={displayName}
              onLogout={() => logout(true)}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </aside>
      </div>

      {/* Main column — the only scroll container */}
      <div className="flex min-w-0 grow flex-col overflow-hidden">
        {/* Mobile top bar: back on drill-downs, otherwise the menu · title · account */}
        <header className="app-bar z-20 flex shrink-0 items-center gap-1 border-b border-ink-700/60 bg-ink-900/80 backdrop-blur-xl lg:hidden">
          {backTarget ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-mist-muted transition active:bg-ink-800 active:text-mist"
            >
              <IconBack className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-mist-muted transition active:bg-ink-800 active:text-mist"
            >
              <IconMenu className="h-5 w-5" />
            </button>
          )}

          <p className="min-w-0 grow truncate px-1 text-base font-semibold text-mist">{title}</p>

          <NavLink
            to="/profile"
            aria-label="My account"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-mist-muted transition active:bg-ink-800 active:text-mist"
          >
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-grad text-[11px] font-semibold text-white">
                {initialsFrom(user) || <IconUser className="h-4 w-4" />}
              </span>
            )}
          </NavLink>
        </header>

        <main className="app-main grow overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export { Layout };
