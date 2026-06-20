import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { getProfileDisplayName } from '@/auth';

function initialsFrom(user) {
  const a = (user?.name || '').trim()[0] || '';
  const b = (user?.surname || '').trim()[0] || '';
  const fallback = (user?.emailAddress || 'U').trim()[0] || 'U';
  return (a + b || fallback).toUpperCase();
}

const navItemClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ');

const Layout = () => {
  const { headerUser, logout } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = headerUser?.user;
  const displayName = getProfileDisplayName({
    name: user?.name,
    surname: user?.surname,
    email: user?.emailAddress,
  });

  return (
    <div className="flex min-h-full grow flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold text-gray-900">
              Cloudgate React
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink to="/" end className={navItemClass}>
                Home
              </NavLink>
              <NavLink to="/profile" className={navItemClass}>
                Profile
              </NavLink>
            </nav>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-gray-100"
            >
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {initialsFrom(user)}
                </span>
              )}
              <span className="hidden text-sm font-medium text-gray-700 sm:inline">{displayName}</span>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="truncate text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="truncate text-xs text-gray-500">{user?.emailAddress}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => logout(true)}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl grow px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export { Layout };
