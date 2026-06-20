import { Outlet } from 'react-router-dom';
import { idpConfig } from '@/config/idpConfig';
import { BrandedLogo } from './BrandedLogo';

export function AuthLayout() {
  if (!idpConfig.enabled) {
    return (
      <div className="auth-shell">
        <div className="auth-shell-inner">
          <div className="auth-panel text-center">
            <h1 className="text-lg font-semibold text-gray-900">IdP not configured</h1>
            <p className="mt-2 text-sm text-gray-600">
              Set <code className="rounded bg-gray-100 px-1">VITE_IDP_API_URL</code> and{' '}
              <code className="rounded bg-gray-100 px-1">VITE_IDP_TENANCY_NAME</code> in your{' '}
              <code className="rounded bg-gray-100 px-1">.env</code> file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-shell-inner">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <BrandedLogo />
          </div>
          <div className="auth-panel">
            <Outlet />
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">
            Powered by Cloudgate Identity Provider
          </p>
        </div>
      </div>
    </div>
  );
}
