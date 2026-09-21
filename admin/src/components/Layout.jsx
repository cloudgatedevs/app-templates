import { Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X, ChevronLeft, ChevronRight, LogOut, Layers3 } from 'lucide-react';
import { useAuthContext, getProfileDisplayName } from '@/auth';
import { useSettings } from '@/settings/SettingsProvider';
import { PoweredByCloudgate } from '@/integrations/CloudgateAbout';
import { Brand } from './Brand';
import { NAV, routeTitle, backTargetFor } from './navConfig';
import { PageSkeleton } from './ScreenLoader';

function NavLinks({ onNavigate }) {
  return (
    <nav aria-label="Back office" className="sidebar-nav space-y-5">
      {['Workspace', 'Administration', 'Settings'].map((group) => (
        <div key={group}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.14em] text-mist-dim">
            {group}
          </p>
          <div className="space-y-1">
            {NAV.filter((item) => item.group === group).map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'is-active' : ''}`
                }
              >
                <span className="nav-icon"><Icon size={18} strokeWidth={1.7} /></span>
                <span className="flex-1">{label}</span>
                <span className="nav-indicator" aria-hidden="true" />
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
function UserCard({ onNavigate }) {
  const { currentUser, logout } = useAuthContext();
  const user = currentUser?.user;
  const name = getProfileDisplayName({ name: user?.name, surname: user?.surname, email: user?.emailAddress });
  return (
    <div className="user-card flex items-center gap-2">
      <NavLink to="/profile" onClick={onNavigate} className="user-profile flex min-w-0 flex-1 items-center gap-3 rounded-xl">
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-accent/10 text-sm font-semibold text-accent">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            name.slice(0, 1).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-[11px] text-mist-dim">{user?.emailAddress}</p>
        </div>
      </NavLink>
      <button className="btn-ghost p-2" aria-label="Sign out" onClick={() => logout(true)}>
        <LogOut size={16} />
      </button>
    </div>
  );
}
export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const main = useRef(null);
  const back = backTargetFor(location.pathname);
  const environment = (import.meta.env.VITE_CLOUDGATE_API_ENV || 'sbx').toLowerCase();
  const isProduction = ['prod', 'production'].includes(environment);
  useEffect(() => {
    setOpen(false);
    main.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const close = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  const sidebar = (
    <>
      <div className="sidebar-brand px-3 pb-6">
        <Brand />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NavLinks onNavigate={() => setOpen(false)} />
      </div>
      <div className="space-y-4 pt-5">
        <PoweredByCloudgate
          onOpen={() => {
            navigate('/about');
            setOpen(false);
          }}
          className="w-full"
        />
        <UserCard onNavigate={() => setOpen(false)} />
      </div>
    </>
  );
  return (
    <div className="app-shell flex h-[100dvh] w-full overflow-hidden">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="app-sidebar hidden shrink-0 flex-col lg:flex">
        {sidebar}
      </aside>
      <div className="workspace-shell flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="workspace-bar hidden shrink-0 items-center justify-between gap-4 lg:flex">
          <div className="flex min-w-0 items-center gap-2.5 text-xs">
            <Layers3 size={16} className="shrink-0 text-mist-dim" />
            <span className="max-w-48 truncate text-mist-dim">{settings.app_name}</span>
            <ChevronRight size={13} className="shrink-0 text-mist-dim/60" />
            <span className="truncate font-medium text-mist-muted">{routeTitle(location.pathname)}</span>
          </div>
          <span className={`environment-pill ${isProduction ? 'is-production' : ''}`}>
            <span aria-hidden="true" />{isProduction ? 'Production' : 'Sandbox'}
          </span>
        </header>
        <header className="app-bar flex shrink-0 items-center gap-2 border-b border-ink-700 bg-ink-850 lg:hidden">
          {back ? (
            <button
              className="btn-ghost p-2"
              aria-label="Go back"
              onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate(back))}
            >
              <ChevronLeft size={21} />
            </button>
          ) : null}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button className="btn-ghost p-2" aria-label="Open menu">
                <Menu size={21} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-backdrop fixed inset-0 z-40" />
              <Dialog.Content className="app-drawer fixed inset-y-0 left-0 z-50 flex w-[min(19rem,88vw)] flex-col bg-ink-850 outline-none">
                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Back office navigation and account controls.
                </Dialog.Description>
                <Dialog.Close className="icon-button absolute right-3 top-3 p-2 text-mist-muted" aria-label="Close menu">
                  <X size={19} />
                </Dialog.Close>
                {sidebar}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <p className="min-w-0 flex-1 truncate px-1 text-base font-semibold">
            {routeTitle(location.pathname)}
          </p>
        </header>
        <main ref={main} tabIndex={-1} className="app-main flex-1 overflow-y-auto" id="main-content">
          <div className="mx-auto w-full max-w-7xl">
            <Suspense fallback={<PageSkeleton />}>
              <div key={location.pathname} className="page-transition">
                <Outlet />
              </div>
            </Suspense>
            {settings.footer_note && (
              <footer className="mt-10 border-t border-ink-700 pt-5 text-xs text-mist-dim">
                {settings.footer_note}
              </footer>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
